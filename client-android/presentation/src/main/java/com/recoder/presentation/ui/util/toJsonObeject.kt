package com.recoder.presentation.ui.util

import org.json.JSONException
import org.json.JSONObject

fun toJsonObject(data: String?): JSONObject {
	return try {
		JSONObject(data)
	} catch (e: JSONException) {
		e.printStackTrace()
		JSONObject()
	}
}

fun jsonPut(json: JSONObject, key: String?, value: Any?) {
	try {
		json.put(key, value)
	} catch (e: JSONException) {
		e.printStackTrace()
	}
}