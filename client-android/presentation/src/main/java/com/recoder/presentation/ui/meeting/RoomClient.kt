package com.recoder.presentation.ui.meeting

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.preference.PreferenceManager
import com.recoder.presentation.model.ConsumerHolder
import com.recoder.presentation.model.RoomOptions
import com.recoder.presentation.model.RoomStore
import com.recoder.presentation.peer.PeerConnectionUtils
import com.recoder.presentation.socketDTO.*
import com.recoder.presentation.ui.util.timber
import com.recoder.presentation.ui.util.toJsonObject
import io.socket.client.Ack
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import org.mediasoup.droid.Device
import org.mediasoup.droid.Producer
import org.mediasoup.droid.RecvTransport
import org.mediasoup.droid.SendTransport
import org.webrtc.AudioTrack
import org.webrtc.VideoTrack
import timber.log.Timber
import java.util.concurrent.ConcurrentHashMap

enum class MediaType(val value: String) {
    AUDIO("audio"),
    VIDEO("video"),
    HAND("hand"),
    NONE("")
}

class RoomClient constructor(
    private val context: Context,
    private val link: String,
    private val name: String = "Uzun",
//	private val room : Room,
) {

    enum class ConnectionState {
        NEW,  // connecting or reconnecting.
        CONNECTING,  // connected.
        CONNECTED,  // mClosed.
        CLOSED
    }

    private lateinit var socket: Socket
    private var device: Device? = null
    private var rtpCapability: String? = null

    private var producerTransport: SendTransport? = null
    private var consumerTransport: RecvTransport? = null

    private lateinit var producerTransportId: String
    private lateinit var consumerTransportId: String

    private lateinit var consumerListener: ConsumerListener
    private lateinit var producerListener: ProducerListener

    private var roomStore: RoomStore = RoomStore()
    private var options: RoomOptions = RoomOptions()

    private var audioProducer: Producer? = null
    private var videoProducer: Producer? = null

    var localAudioTrack: AudioTrack? = null
    var localVideoTrack: VideoTrack? = null

    var peerConnectionUtils: PeerConnectionUtils? = null
    private var workHandler: Handler? = null
    private var mainHandler: Handler? = null

    private var consumers: ConcurrentHashMap<String, ConsumerHolder> = ConcurrentHashMap()

    init {
        CoroutineScope(Dispatchers.Main).launch {
            initWorkerHandler()
            initSocketConnection().join()

            if (socket.id() == null) return@launch Timber.e("SOCKET ID IS NULL!!")

            listOf(
                initRoomStore(),
                initRoomConfig()
            ).joinAll()
            listOf(
                initProducerTransport(),
                initConsumerTransport()
            ).joinAll()
            initSocketSubscriptions()
            initProduces()
            getProducers()
        }
    }

    /* ########## INITIALIZATION ########## */

    private fun initWorkerHandler() {
        val handlerThread = HandlerThread("worker")
        handlerThread.start()
        workHandler = Handler(handlerThread.looper)
        mainHandler = Handler(Looper.getMainLooper())
        workHandler!!.post { peerConnectionUtils = PeerConnectionUtils() }
    }

    private fun initRoomStore() = CoroutineScope(Dispatchers.Main).launch {
        roomStore.setMe(socket.id(), name, options.device)
        roomStore.setRoomUrl(link.split("/").last(), link)
    }

    private fun initSocketConnection() = CoroutineScope(Dispatchers.Main).launch {
        runCatching {
//            socket = IO.socket("http://3.36.88.215:5000/")
            socket = IO.socket("http://10.0.2.2:5000/")
            Timber.e(">> socket : $socket")
            socket.connect()
            Timber.e(">> socket : $socket, socketId : ${socket.id()}")
        }.timber("소켓 연결")
    }

    private fun initRoomConfig() = CoroutineScope(Dispatchers.IO).launch {

        createRoom(link) // Room 생성 (suspend)
        join(name = name, link = link, true, true, false, false)

        Timber.d("NOW YOU [uzun] ARE IN THE ROOM [$link]")

        val preferences = PreferenceManager.getDefaultSharedPreferences(context)

        options.isProduce = preferences.getBoolean("produce", true)
        options.isConsume = preferences.getBoolean("consume", true)
        options.isForceTcp = preferences.getBoolean("forceTcp", false)
        options.isUseDataChannel = preferences.getBoolean("dataChannel", true)

        // Device config.
        val camera: String? = preferences.getString("camera", "front")
        PeerConnectionUtils.setPreferCameraFace(camera ?: "")

        // routerRtpCapabilities 가져오기
        getRouterRtpCapabilities()

        // 받아온 routerRtpCapabilities 로 device 로드
        withContext(Dispatchers.Default) {
            runCatching {
                device = Device()
                device!!.load(rtpCapability ?: "", null)
            }.timber("DEVICE").onSuccess {
                Timber.d(">>> DEVICE LOADED! : ${device.toString()}")
            }
        }

        consumerListener = ConsumerListener(socket)
        producerListener = ProducerListener(socket)
    }

    private fun initSocketSubscriptions() = CoroutineScope(Dispatchers.IO).launch {
        // updatePeerInfo 참가자 상태 변경 정보
        socket.runCatching {
            lateinit var deferred: Deferred<String>
            this.on("peerAction") { deferred = async { it[0] as String } }
            deferred.await()
        }
            .onSuccess {
                val updatedInfo = Json.decodeFromString(it) as PeerUpdateInfo
                roomStore.updatePeerInfo(updatedInfo)
            }
            .timber("On Update Peer Info")

        // setVideoOff video 꺼짐 공유
        socket.runCatching {
            lateinit var deferred: Deferred<String>
            this.on("setVideoOff") { deferred = async { it[0] as String } }
            deferred.await()
        }
            .onSuccess {
                val peerVideoOption = Json.decodeFromString(it) as PeerVideoOption
                roomStore.updatePeerInfo(peerVideoOption.toPeerUpdateInfo())
            }
            .timber("On set Video Off")

        // newProducers 새로운 producer 리스트 받아오기
        socket.runCatching {
            lateinit var deferred: Deferred<String>
            this.on("newProducers") { deferred = async { it[0] as String } }
            deferred.await()
        }
            .onSuccess {
                val peerVideoOption = Json.decodeFromString(it) as PeerVideoOption
                roomStore.updatePeerInfo(peerVideoOption.toPeerUpdateInfo())
            }
            .timber("On new Producers")

        // refreshParticipantsCount 참가자 수 갱신
        socket.runCatching {
            lateinit var deferred: Deferred<String>
            this.on("refreshParticipantsCount") { deferred = async { it[0] as String } }
            deferred.await()
        }
            .onSuccess {
                val roomPeerCount = Json.decodeFromString(it) as RoomPeerCount
                roomStore.setRoomPeerCount(roomPeerCount.peer_counts)
            }
            .timber("On refresh Participants Count")

        // removeMe 나간 참가자 갱신
        socket.runCatching {
            lateinit var deferred: Deferred<String>
            this.on("removeMe") { deferred = async { it[0] as String } }
            deferred.await()
        }
            .onSuccess {
                val removeInfo = Json.decodeFromString(it) as RemoveInfo
                roomStore.removePeer(removeInfo.peer_id)
            }
            .timber("On remove Me")

    }

    /* ########## CONNECTION CONFIGURATION ########## */

    private suspend fun join(name: String, link: String, vararg booleans: Boolean?) {

        val paramData = JSONObject(
            mapOf(
                "peer_info" to Json.encodeToString(
                    PeerInfo(
                        name,
                        socket.id(),
                        link,
                        (booleans[0] ?: false),
                        (booleans[1] ?: false),
                        (booleans[2] ?: false),
                        (booleans[3] ?: false)
                    )
                )
            )
        )

        val peers = withContext(Dispatchers.IO) {
            lateinit var deferred: Deferred<Peers>
            socket.runCatching {
                this.emit("join",
                    paramData,
                    Ack {
                        deferred = async {
                            val res = (it[0] as JSONObject)
                            Timber.d(res.toString(2))
                            Json.decodeFromString(res["peers"].toString())
                        }
                    }
                )
            }.timber("join")
            deferred.await()
        }
    }

    private suspend fun createRoom(link: String) = withContext(Dispatchers.IO) {
        socket.runCatching {
            this.emit(
                "createRoom",
                JSONObject(mapOf("room_id" to link)),
                Ack { Timber.d((it[0] as JSONObject).toString(2)) }
            )
        }.timber("createRoom")
    }

    private suspend fun getRouterRtpCapabilities() = withContext(Dispatchers.IO) {
        Timber.d(">>> START getRouterRtpCapabilities()")
        socket.runCatching {
            var deferred: Deferred<JSONObject>? = null
            this.emit(
                "getRouterRtpCapabilities",
                JSONObject(),
                Ack { deferred = async { it[0] as JSONObject } }
            )
            delay(1_000)
            rtpCapability = deferred?.await()!!.toString()
            Timber.d("rtpCapability : $rtpCapability")
            rtpCapability
        }
            .timber("getRouterRtpCapabilities")
            .getOrNull()
    }

    /* ########## TRANSPORT CONFIGURATION ########## */

    private fun initProducerTransport() = CoroutineScope(Dispatchers.IO).launch {
        Timber.d(">>> START initProducerTransport()")
        val transportData = createWebRtcTransport()
        Timber.d("WebRtc Transport data : ${transportData.toString()}")
        val transportDataJson = toJsonObject(transportData.toString())
        producerTransportId = transportDataJson.get("id").toString()

        producerTransport = device?.createSendTransport(
            consumerListener,
            transportDataJson.get("id").toString(),
            transportDataJson.get("iceParameters").toString(),
            transportDataJson.get("iceCandidates").toString(),
            transportDataJson.get("dtlsParameters").toString(),
        )
    }

    private fun initConsumerTransport() = CoroutineScope(Dispatchers.IO).launch {
        Timber.d(">>> START initConsumerTransport()")
        val transportData = createWebRtcTransport()
        Timber.d("WebRtc Transport data : ${transportData.toString()}")
        val transportDataJson = toJsonObject(transportData.toString())
        consumerTransportId = transportDataJson.get("id").toString()

        consumerTransport = device?.createRecvTransport(
            ProducerListener(socket),
            transportDataJson.get("id").toString(),
            transportDataJson.get("iceParameters").toString(),
            transportDataJson.get("iceCandidates").toString(),
            transportDataJson.get("dtlsParameters").toString(),
        )
    }

    private suspend fun createWebRtcTransport() = withContext(Dispatchers.IO) {
        Timber.d(">>> START createWebRtcTransport()")
        socket.runCatching {
            var deferred: Deferred<JSONObject>? = null
            this.emit(
                "createWebRtcTransport",
                JSONObject(),
                Ack { deferred = async { it[0] as JSONObject } }
            )
            delay(500)
            deferred!!.await()
        }
            .timber("createWebRtcTransport")
            .getOrNull()
    }

    /* ########## PRODUCE MEDIA ########## */

    private fun produceAudio() = CoroutineScope(Dispatchers.IO).launch {
        Timber.d(">>> START produceAudio()")
        if (audioProducer != null) return@launch Timber.e("audio producer is already exist")
        if (!device!!.isLoaded) return@launch Timber.e("device is not loaded")
        if (!device!!.canProduce("audio")) return@launch Timber.e("device cannot produce audio")
        if (consumerTransport == null) return@launch Timber.e("consumerTransport is null")
        if (localAudioTrack == null) {
            localAudioTrack = peerConnectionUtils?.createAudioTrack(context, "mic")
            localAudioTrack?.setEnabled(true)
        }

        Timber.d(">>> localAudioTrack : $localAudioTrack")

        audioProducer = runCatching {
            producerTransport?.produce(
                { producer ->
                    Timber.d("onTransportClose()")
                },
                localAudioTrack,
                null,
                null,
                toJsonObject(rtpCapability).getString("codecs")
            )
        }
            .timber("Audio Produce")
            .onFailure {
                it.printStackTrace()
                localAudioTrack?.setEnabled(false)
            }
            .getOrThrow() as Producer

        roomStore.addProducer(audioProducer)
    }

    private fun produceVideo() = CoroutineScope(Dispatchers.IO).launch {
        Timber.d(">>> START produceVideo()")
        if (videoProducer != null) return@launch Timber.e("video producer producer already exist")
        if (!device!!.isLoaded) return@launch Timber.e("device is not loaded")
        if (!device!!.canProduce("video")) return@launch Timber.e("device cannot produce video")
        if (consumerTransport == null) return@launch Timber.e("consumerTransport is null")
        if (localVideoTrack == null) {
            localVideoTrack = peerConnectionUtils?.createVideoTrack(context, "cam")
            localVideoTrack?.setEnabled(true)
        }

        Timber.d(">>> localVideoTrack : $localVideoTrack")

        videoProducer = runCatching {
            producerTransport?.produce(
                { producer ->
                    Timber.d("onTransportClose()")
                },
                localVideoTrack,
                null,
                null,
                toJsonObject(rtpCapability).getString("codecs") ?: null
            )
        }
            .timber("Video Produce")
            .onFailure {
                it.printStackTrace()
                localVideoTrack?.setEnabled(false)
            }
            .getOrThrow() as Producer

        roomStore.addProducer(videoProducer)
    }

    private fun initProduces() {
        Timber.d(">>> START initProduces()")
        runCatching {
            if (options.isProduce && device != null) {
                roomStore.setMediaCapabilities(
                    device!!.canProduce("audio"),
                    device!!.canProduce("video"),
                )
                produceVideo()
                produceAudio()
            }
        }
            .timber("audio & video produce")
            .onFailure {
                it.printStackTrace()
                exitRoom()
            }
    }

    /* ########## GET PRODUCERS ########## */

    private fun getProducers() = CoroutineScope(Dispatchers.IO).launch {
        socket.runCatching { this.emit("getProducers", JSONObject()) }.timber("getProduceres")
    }

    /* ########## CONSUME ########## */

    private fun onNewConsumer(producerId: String, peer_id: String, type: MediaType) =
        CoroutineScope(Dispatchers.IO).launch {
            Timber.d(">>> START consume()")
            if (options.isConsume)
                return@launch Timber.e("can not consume ${type.value}")

            lateinit var deferred: Deferred<String>
            var paramsString = runCatching {
                socket.emit(
                    "consume",
                    JSONObject(
                        mapOf(
                            "consumerTransportId" to consumerTransportId,
                            "producerId" to producerId,
                            "rtpCapability" to device!!.rtpCapabilities,
                        )
                    ),
                    Ack { deferred = async { it[0] as String } }
                )
                deferred.await()
            }
                .timber("socket emit consume")
                .onSuccess { toJsonObject(it.toString()).toString(2) }
                .getOrDefault("") as String

            val params = toJsonObject(paramsString)

            runCatching {
                val consumer = consumerTransport!!.consume(
                    { consumer ->
                        consumers.remove(consumer.id)
                        roomStore.removeConsumer(socket.id(), consumer.id)
                        Timber.w("onTransportClose for consume")
                    },
                    params["id"].toString(),
                    producerId,
                    params["kind"].toString(),
                    params["rtpParameters"].toString(),
                )
                consumers[consumer.id] = ConsumerHolder(peer_id, consumer)
                roomStore.addConsumer(peer_id, type.value, consumer, false)
            }.timber("consume transport")
        }

    /* ########## CONFIGURATION ########## */

    fun exitRoom() {
        socket.runCatching {
            this.emit(
                "exitRoom",
                JSONObject(),
                Ack { Timber.d(it[0].toString()) }
            )
        }.timber("exit Room")
    }
}