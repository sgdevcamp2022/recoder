package com.recoder.presentation.ui.base

enum class LoadState {
    SUCCESS,
    LOADING,
    ERROR;
}

fun LoadState.isSuccessful() = this == LoadState.SUCCESS