package com.recoder.domain.usecase

import com.recoder.domain.repository.MeetingRepository
import javax.inject.Inject

class CreateLinkUseCase @Inject constructor(
    private val repository: MeetingRepository,
) {
    suspend operator fun invoke(): Result<String> {
        return repository.createLink()
    }
}
