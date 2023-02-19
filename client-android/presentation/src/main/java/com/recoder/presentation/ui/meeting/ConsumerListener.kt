package com.recoder.presentation.ui.meeting

import com.recoder.presentation.ui.util.timber
import com.recoder.presentation.ui.util.toJsonObject
import io.socket.client.Ack
import io.socket.client.Socket
import org.json.JSONObject
import org.mediasoup.droid.SendTransport
import org.mediasoup.droid.Transport
import timber.log.Timber

class ConsumerListener(socket: Socket) : SendTransport.Listener {

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
                Ack { Timber.d("producer OnConnect ACK >> ${it[0]}") }
            )
        }.timber("producer OnConnect")
    }

    override fun onProduce(
        transport: Transport?,
        kind: String?,
        rtpParameters: String?,
        appData: String?,
    ): String {
        return _socket.runCatching {
            var res = ""
            this.emit("produce",
                JSONObject(
                    mapOf(
                        "producerTransportId" to (transport?.id ?: ""),
                        "kind" to (kind ?: ""),
                        "appData" to toJsonObject(appData),
                        "rtpParameters" to toJsonObject(rtpParameters),
                    )
                ),
                Ack { res = it[0].toString() }
            )
            Timber.d("on Produce >> $res")
            res
        }
            .timber("producer onProduce")
            .getOrDefault("") as String
    }

    override fun onConnectionStateChange(
        transport: Transport?,
        connectionState: String?,
    ) = Unit

    override fun onProduceData(
        transport: Transport?,
        sctpStreamParameters: String?,
        label: String?,
        protocol: String?,
        appData: String?,
    ) = ""
}