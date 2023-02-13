package com.recoder.data.network

import retrofit2.Response
import retrofit2.http.GET

interface MeetingApi {

    @GET("/createLink")
    suspend fun createLink() : Response<String>

}