package com.recoder.presentation.model

import org.mediasoup.droid.Consumer

data class ConsumerHolder(
	var peerId : String,
	var consumer: Consumer
)
