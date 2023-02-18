package com.recoder.presentation.model

import org.json.JSONArray
import org.mediasoup.droid.Producer
import java.util.concurrent.ConcurrentHashMap

data class Producers(
	private val producers: MutableMap<String, ProducerInfo> = ConcurrentHashMap()
) {

	data class ProducerInfo (
		val producer: Producer,
		var score: JSONArray? = null,
		var type: String? = null
	) {
		companion object {
			const val TYPE_CAM = "cam"
			const val TYPE_SHARE = "share"
		}
	}

	fun addProducer(producer: Producer) {
		producers[producer.id] = ProducerInfo(producer)
	}

	fun removeProducer(producerId: String) {
		producers.remove(producerId)
	}

	fun setProducerPaused(producerId: String) {
		val wrapper = producers[producerId] ?: return
		wrapper.producer.pause()
	}

	fun setProducerResumed(producerId: String) {
		val wrapper = producers[producerId] ?: return
		wrapper.producer.resume()
	}

	fun setProducerScore(producerId: String, score: JSONArray?) {
		val wrapper = producers[producerId] ?: return
		wrapper.score = score
	}

	fun filter(kind: String): ProducerInfo? {
		for (wrapper in producers.values) {
			if (wrapper.producer == null) continue
			if (wrapper.producer.track == null) continue
			if (kind == wrapper.producer.track.kind()) return wrapper
		}
		return null
	}

	fun clear() {
		producers.clear()
	}
}