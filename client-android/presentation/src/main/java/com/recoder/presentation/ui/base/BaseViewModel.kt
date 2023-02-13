package com.recoder.presentation.ui.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

abstract class BaseViewModel<S : ViewState, E : ViewEvent>(
    initialState: S
) : ViewModel() {

    abstract fun handleEvents(event: E)

    private val _viewState: MutableStateFlow<S> = MutableStateFlow<S>(initialState)
    val viewState = _viewState.asStateFlow()

    private val currentState: S
        get() = _viewState.value

    private val _event: MutableSharedFlow<E> = MutableSharedFlow()

    protected fun updateState(reducer: S.() -> S) {
        val newState = currentState.reducer()
        _viewState.value = newState
    }

    open fun setEvent(event : E) {
        deliverEvent(event)
    }

    private fun deliverEvent(event : E) = viewModelScope.launch {
        handleEvents(event)
    }
}