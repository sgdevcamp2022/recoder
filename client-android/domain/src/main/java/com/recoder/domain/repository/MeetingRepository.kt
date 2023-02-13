package com.recoder.domain.repository

interface MeetingRepository {

    suspend fun createLink() : Result<String>

}