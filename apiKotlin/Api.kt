package com.sbma.linkup.api

import com.sbma.linkup.api.apimodels.ApiCard
import com.sbma.linkup.api.apimodels.ApiConnection
import com.sbma.linkup.api.apimodels.ApiShare
import com.sbma.linkup.api.apimodels.ApiTag
import com.sbma.linkup.api.apimodels.ApiUser
import com.sbma.linkup.api.apimodels.AssignTagRequest
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ApiService {

    // Form GET Request
    @GET("/form")
    @Headers("Content-Type: application/json")
    suspend fun getForm(@Header("Authorization") authorization: String): Result<ApiUser>

    // New Form POST Request
    @POST("/card")
    @Headers("Content-Type: application/json")
    suspend fun createNewForm(@Header("Authorization") authorization: String, @Body request: ApiCard): Result<ApiCard>

    // Update Form PUT Request
    @PUT("/form/{id}")
    @Headers("Content-Type: application/json")
    suspend fun updateForm(@Header("Authorization") authorization: String, @Path("id") id: String, @Body request: ApiCard): Result<ApiCard>

    // Update Card PUT Request
    @DELETE("/form/{id}")
    @Headers("Content-Type: application/json")
    suspend fun deleteForm(@Header("Authorization") authorization: String, @Path("id") id: String): Result<Unit>

    // Share POST Request
    @POST("/share")
    @Headers("Content-Type: application/json")
    suspend fun shareForm(@Header("Authorization") authorization: String, @Body shareData: List<String>): Result<ApiShare>

    // Scan POST Request
    @POST("/share/{shareId}/scan")
    @Headers("Content-Type: application/json")
    suspend fun scanShare(@Header("Authorization") authorization: String, @Path("shareId") shareId: String): Result<ApiConnection>

}