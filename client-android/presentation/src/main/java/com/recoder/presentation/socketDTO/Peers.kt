package com.recoder.presentation.socketDTO

import com.recoder.presentation.ui.meeting.MediaType
import org.mediasoup.droid.Consumer
import timber.log.Timber
import java.util.*

data class Peers(
    private val peerInfos: MutableMap<String, Peer>
    = Collections.synchronizedMap(LinkedHashMap()),
) {
    fun addPeer(peer: Peer) {
        peerInfos[peer.id] = peer
    }

    fun removePeer(peerId: String) {
        peerInfos.remove(peerId)
    }

    fun updatePeerIndo(info: PeerUpdateInfo) {
        val peerInfo = getPeer(info.peer_id).peer_info
        when (info.mediaType) {
            MediaType.AUDIO -> peerInfo.peer_audio = info.status
            MediaType.HAND -> peerInfo.peer_hand = info.status
            MediaType.VIDEO -> {
                when (info.type) {
                    "videoType" -> peerInfo.peer_video = info.status
                    "screenType" -> peerInfo.peer_screen = info.status
                }
            }
            MediaType.NONE -> Timber.e("can not find peer info media type")
        }

    }

    fun addConsumer(peerId: String, consumer: Consumer) {
        getPeer(peerId).consumers.add(consumer.id)
    }

    fun removeConsumer(peerId: String, consumerId: String) {
        getPeer(peerId).consumers.remove(consumerId)
    }

    fun addDataConsumer(peerId: String, consumer: Consumer) {}

    fun removeDataConsumer(peerId: String, consumerId: String) {}

    fun getPeer(id: String): Peer {
        val peer = peerInfos[id] ?: Timber.e("peer [$id] not found")
        return if (peer is Peer) peer else Peer()
    }

    fun getAllPeers() = peerInfos.toList()

    fun clear() {
        peerInfos.clear()
    }
}