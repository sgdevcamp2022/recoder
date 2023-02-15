package com.recoder.data.di

import com.recoder.data.di.NetworkModule.ScalarRetrofit
import com.recoder.data.network.MeetingApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {

    @Singleton
    @Provides
    fun provideMeetingApi(
        @ScalarRetrofit retrofit: Retrofit
    ): MeetingApi
        = retrofit.create(MeetingApi::class.java)

}