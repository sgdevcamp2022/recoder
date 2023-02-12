package com.recoder.domain.util

import java.io.IOException

sealed interface NetworkResult<T : Any>

class Success<T : Any>(val data: T) : NetworkResult<T>
class Error<T : Any>(val code: Int, val message: String?) : NetworkResult<T>
class Exception<T : Any>(val exception: Throwable) : NetworkResult<T>