package com.recoder.presentation.socketDTO

@kotlinx.serialization.Serializable
data class RoomPeerCount(
    val rood_id: String = "",
    val peer_counts: Int = 0,
)
