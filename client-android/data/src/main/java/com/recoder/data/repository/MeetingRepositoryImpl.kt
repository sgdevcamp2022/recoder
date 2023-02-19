package com.recoder.data.repository

import com.recoder.data.network.MeetingApi
import com.recoder.data.network.handleApi
import com.recoder.domain.repository.MeetingRepository
import javax.inject.Inject

class MeetingRepositoryImpl @Inject constructor(
    private val api: MeetingApi
) : MeetingRepository {

    override suspend fun createLink() =
        runCatching {
            handleApi {
                api.createLink()
            }.getOrThrow().link
        }

}