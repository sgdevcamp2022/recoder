package com.recoder.presentation.socketDTO

import kotlinx.serialization.Serializable

@Serializable
data class Peer(
    val id: String = "",
    val peer_info: PeerInfo = PeerInfo(),
    val consumers: MutableSet<String> = HashSet(),
    val producers: MutableSet<String> = HashSet(),
    val transports: MutableSet<String> = HashSet(),
)