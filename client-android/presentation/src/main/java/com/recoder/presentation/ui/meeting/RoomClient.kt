package com.recoder.presentation.ui.meeting

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import com.recoder.presentation.model.*
import com.recoder.presentation.peer.PeerConnectionUtils
import com.recoder.presentation.ui.util.timber
import com.recoder.presentation.ui.util.toJsonObject
import io.socket.client.Ack
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.*
import org.json.JSONObject
import org.mediasoup.droid.Device
import org.mediasoup.droid.Producer
import org.mediasoup.droid.RecvTransport
import org.mediasoup.droid.SendTransport
import org.webrtc.AudioTrack
import org.webrtc.VideoTrack
import timber.log.Timber
import java.util.concurrent.ConcurrentHashMap

enum class MediaType(val value: String) { AUDIO("audio"), VIDEO("video") }

class RoomClient constructor(
	private val context: Context,
	private val link: String,
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
	private var isAudioAllowed: Boolean = false
	private var isVideoAllowed: Boolean = false
	private var audioProducer: Producer? = null
	private var videoProducer: Producer? = null
	private var localAudioTrack: AudioTrack? = null
	private var localVideoTrack: VideoTrack? = null
	private var producerLabel = mutableMapOf<MediaType, Int>()

	var peerConnectionUtils: PeerConnectionUtils? = null
	private var workHandler: Handler? = null
	private var mainHandler: Handler? = null

	private var consumers : ConcurrentHashMap<String, ConsumerHolder> = ConcurrentHashMap()

	init {
		CoroutineScope(Dispatchers.Main).launch {
			initConfigs()
			initProduces()
		}
	}

	/* ########## INITIALIZATION ########## */

	private suspend fun initConfigs() = withContext(Dispatchers.IO) {
		initWorkerHandler()
		initSocketConnection()
		initRoomConfig()
		initProducerTransport()
		initConsumerTransport()
	}

	private fun initWorkerHandler() {
		val handlerThread = HandlerThread("worker")
		handlerThread.start()
		workHandler = Handler(handlerThread.looper)
		mainHandler = Handler(Looper.getMainLooper())
		workHandler!!.post(java.lang.Runnable { peerConnectionUtils = PeerConnectionUtils() })
	}

	private fun initSocketConnection() {

		runCatching {
			socket = IO.socket("http://10.0.2.2:5000/")
		}.timber("소켓 연결 1")

		socket.runCatching { this.connect() }.timber("소켓 연결 2")
	}

	private fun initRoomConfig() = CoroutineScope(Dispatchers.IO).launch {

		createRoom(link) // Room 생성 (suspend)
		join(name = "uzun", link = link, true, true, false, false)

		Timber.d("NOW YOU [uzun] ARE IN THE ROOM [$link]")

		// routerRtpCapabilities 가져오기
		getRouterRtpCapabilities()

		// 받아온 routerRtpCapabilities 로 device 로드
		device = Device()
		device!!.load(rtpCapability ?: "", null)

		consumerListener = ConsumerListener(socket)
		producerListener = ProducerListener(socket)
	}

	/* ########## CONNECTION CONFIGURATION ########## */

	private suspend fun join(name: String, link: String, vararg booleans: Boolean?) {

		val paramData = JSONObject(
			mapOf(
				"peer_info" to JSONObject(
					mapOf(
						"peer_name" to name,
						"peer_id" to socket.id(),
						"room_id" to link,
						"peer_audio" to (booleans[0] ?: false),
						"peer_video" to (booleans[1] ?: false),
						"peer_screen" to (booleans[2] ?: false),
						"peer_hand" to (booleans[3] ?: false),
					)
				)
			)
		)

		withContext(Dispatchers.IO) {
			socket.runCatching {
				this.emit("join",
					paramData,
					Ack { Timber.d((it[0] as JSONObject).toString(2)) }
				)
			}.timber("join")
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
		socket.runCatching {
			var deferred: Deferred<JSONObject>? = null
			this.emit(
				"getRouterRtpCapabilities",
				JSONObject(),
				Ack { deferred = async { it[0] as JSONObject } }
			)
			delay(500)
			rtpCapability = deferred?.await()!!.toString()
			Timber.d("rtpCapability : $rtpCapability")
			rtpCapability
		}
			.timber("getRouterRtpCapabilities")
			.getOrNull()
	}

	/* ########## TRANSPORT CONFIGURATION ########## */

	private fun initProducerTransport() = CoroutineScope(Dispatchers.IO).launch {
		val transportData = createWebRtcTransportAsync()
		Timber.d("WebRtc Transport data : ${transportData.toString()}")
		val transportDataJson = toJsonObject(transportData.toString())
		producerTransportId = transportDataJson.get("id").toString()

		producerTransport = device?.createSendTransport(
			ConsumerListener(socket),
			transportDataJson.get("id").toString(),
			transportDataJson.get("iceParameters").toString(),
			transportDataJson.get("iceCandidates").toString(),
			transportDataJson.get("dtlsParameters").toString(),
		)
	}

	private fun initConsumerTransport() = CoroutineScope(Dispatchers.IO).launch {
		val transportData = createWebRtcTransportAsync()
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

	private suspend fun createWebRtcTransportAsync() = withContext(Dispatchers.IO) {
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
		if (audioProducer != null) return@launch Timber.e("audio producer is already exist")
		if (!device!!.isLoaded) return@launch Timber.e("device is not loaded")
		if (!device!!.canProduce("audio")) return@launch Timber.e("device cannot produce audio")
		if (consumerTransport == null) return@launch Timber.e("consumerTransport is null")
		if (localAudioTrack == null) {
			localAudioTrack = peerConnectionUtils?.createAudioTrack(context, "mic")
			localAudioTrack?.setEnabled(true)
		}

		audioProducer = runCatching {
			producerTransport?.produce(
				{ producer ->
					Timber.d("onTransportClose()")
				},
				localAudioTrack,
				null,
				null,
				null
			)
			roomStore.addProducer(audioProducer)
		}
			.timber("Audio Produce")
			.onFailure {
				it.printStackTrace()
				localAudioTrack?.setEnabled(false)
			}
			.getOrNull() as Producer
	}

	private fun produceVideo() = CoroutineScope(Dispatchers.IO).launch {
		if (videoProducer != null) return@launch Timber.e("video producer producer already exist")
		if (!device!!.isLoaded) return@launch Timber.e("device is not loaded")
		if (!device!!.canProduce("video")) return@launch Timber.e("device cannot produce video")
		if (consumerTransport == null) return@launch Timber.e("consumerTransport is null")
		if (localVideoTrack == null) {
			localVideoTrack = peerConnectionUtils?.createVideoTrack(context, "cam")
			localVideoTrack?.setEnabled(true)
		}

		videoProducer = runCatching {
			producerTransport?.produce(
				{ producer ->
					Timber.d("onTransportClose()")
				},
				localVideoTrack,
				null,
				null,
				null
			)
			roomStore.addProducer(videoProducer)
		}
			.timber("Audio Produce")
			.onFailure {
				it.printStackTrace()
				localVideoTrack?.setEnabled(false)
			}
			.getOrNull() as Producer
	}

	private fun initProduces() {
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

	/* ########## CONSUME ########## */

	private fun consume(producerId: String, peer_id: String, type: MediaType) =
		CoroutineScope(Dispatchers.IO).launch {

			if(options.isConsume)
				return@launch Timber.e("can not consume ${type.value}")

			lateinit var deferred: Deferred<JSONObject>
			val params = runCatching {
				socket.emit(
					"consume",
					JSONObject(
						mapOf(
							"consumerTransportId" to consumerTransportId,
							"producerId" to producerId,
							"rtpCapability" to device!!.rtpCapabilities,
						)
					),
					Ack { deferred = async { it[0] as JSONObject } }
				)
				deferred.await()
			}
				.timber("socket emit consume")
				.onSuccess { toJsonObject(it.toString()).toString(2) }
				.getOrDefault(JSONObject()) as JSONObject

			runCatching {
				val consumer = consumerTransport!!.consume(
					{ consumer ->
						consumers.remove(consumer.id)
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

	private fun exitRoom() {
		socket.runCatching {
			this.emit(
				"exitRoom",
				JSONObject(),
				Ack { Timber.d(it[0].toString()) }
			)
		}.timber("exit Room")
	}
}