package com.recoder.data.network

import retrofit2.HttpException
import retrofit2.Response

suspend fun <T : Any> handleApi(
    execute: suspend () -> Response<T>
): Result<T> {
    return try {
        val response = execute()
        val body = response.body()
        if (response.isSuccessful && body != null) Result.success(body)
        else Result.failure(HttpException(response))
    } catch (e: HttpException) {
        Result.failure(e)
    } catch (e: Throwable) {
        Result.failure(e)
    }
}