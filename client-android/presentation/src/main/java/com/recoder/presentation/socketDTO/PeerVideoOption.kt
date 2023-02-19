package com.recoder.presentation.socketDTO

@kotlinx.serialization.Serializable
data class PeerVideoOption(
    val peer_name: String = "",
    val peer_id: String = "",
    val peer_video: Boolean = false,
) {
    fun toPeerUpdateInfo(): PeerUpdateInfo =
        PeerUpdateInfo(
            "video",
            peer_id,
            peer_name,
            peer_video,
            "videoType"
        )
}
