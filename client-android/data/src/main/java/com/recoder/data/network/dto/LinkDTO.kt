package com.recoder.data.network.dto

import com.google.gson.annotations.SerializedName

data class LinkDTO(
    @SerializedName("link")
    var link: String = "",
)
