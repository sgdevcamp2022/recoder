package com.recoder.presentation.ui.util

import timber.log.Timber

fun Result<*>.timber(msg: String): Result<*> {
	return this
		.onSuccess { Timber.d(">>> 성공 [$msg] ") }
		.onFailure { Timber.d(">>> 실패 [$msg] -> ${it.message}") }
}