package com.recoder.data.di

import com.recoder.data.repository.MeetingRepositoryImpl
import com.recoder.domain.repository.MeetingRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
internal abstract class RepositoryModule {

    @Binds
    abstract fun bindMeetingRepository(
        userRepository: MeetingRepositoryImpl,
    ): MeetingRepository

}