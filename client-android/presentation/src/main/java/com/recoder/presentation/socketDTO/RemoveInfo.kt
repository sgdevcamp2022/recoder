package com.recoder.presentation.socketDTO

@kotlinx.serialization.Serializable
data class RemoveInfo(
    val rood_id: String = "",
    val peer_id: String = "",
    val peer_counts: Int = 0,
)
