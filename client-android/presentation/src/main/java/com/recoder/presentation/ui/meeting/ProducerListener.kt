package com.recoder.presentation.ui.meeting

import com.recoder.presentation.ui.util.timber
import com.recoder.presentation.ui.util.toJsonObject
import io.socket.client.Ack
import io.socket.client.Socket
import org.json.JSONObject
import org.mediasoup.droid.RecvTransport
import org.mediasoup.droid.Transport
import timber.log.Timber

class ProducerListener(socket: Socket) : RecvTransport.Listener {

    private val _socket: Socket = socket

    override fun onConnect(transport: Transport?, dtlsParameters: String?) {
        _socket.runCatching {
            this.emit("connectTransport",
                JSONObject(
                    mapOf(
                        "transport_id" to (transport?.id ?: ""),
                        "dtlsParameters" to toJsonObject(dtlsParameters),
                    )
                ),
                Ack { Timber.d(it[0].toString()) }
            )
        }.timber("consumer OnConnect")
    }

    override fun onConnectionStateChange(
        transport: Transport?,
        connectionState: String?,
    ) = Unit
}