package com.recoder.presentation.model

import org.json.JSONArray
import org.mediasoup.droid.Consumer
import java.util.concurrent.ConcurrentHashMap


data class Consumers(
	private val consumers: MutableMap<String, ConsumerWrapper> = ConcurrentHashMap(),
) {


	data class ConsumerWrapper(
		var type: String,
		var remotelyPaused: Boolean,
		var consumer: Consumer,
		var locallyPaused: Boolean = false,
		var spatialLayer: Int = -1,
		var temporalLayer: Int = -1,
		var preferredSpatialLayer: Int = -1,
		var preferredTemporalLayer: Int = -1,
		var score: JSONArray? = null,
	)

	fun addConsumer(type: String, consumer: Consumer, remotelyPaused: Boolean) {
		consumers[consumer.id] = ConsumerWrapper(type, remotelyPaused, consumer)
	}

	fun removeConsumer(consumerId: String) {
		consumers.remove(consumerId)
	}

	fun setConsumerPaused(consumerId: String, originator: String) {
		val wrapper = consumers[consumerId] ?: return
		if ("local" == originator) {
			wrapper.locallyPaused = true
		} else {
			wrapper.remotelyPaused = true
		}
	}

	fun setConsumerResumed(consumerId: String, originator: String) {
		val wrapper = consumers[consumerId] ?: return
		if ("local" == originator) {
			wrapper.locallyPaused = false
		} else {
			wrapper.remotelyPaused = false
		}
	}

	fun setConsumerCurrentLayers(consumerId: String, spatialLayer: Int, temporalLayer: Int) {
		val wrapper = consumers[consumerId] ?: return
		wrapper.spatialLayer = spatialLayer
		wrapper.temporalLayer = temporalLayer
	}

	fun setConsumerScore(consumerId: String, score: JSONArray?) {
		val wrapper = consumers[consumerId] ?: return
		wrapper.score = score
	}

	fun getConsumer(consumerId: String): ConsumerWrapper? {
		return consumers[consumerId]
	}

	fun clear() {
		consumers.clear()
	}
}
