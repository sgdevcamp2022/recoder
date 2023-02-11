package com.recoder.data.remote.network

import retrofit2.Response
import retrofit2.http.GET

interface RestApiService {

    @GET("/createLink")
    suspend fun createLink() : Response<String>

}