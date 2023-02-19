package com.recoder.data.network

import com.recoder.data.network.dto.LinkDTO
import retrofit2.Response
import retrofit2.http.GET

interface MeetingApi {

    @GET("/createLink")
    suspend fun createLink(): Response<LinkDTO>

}