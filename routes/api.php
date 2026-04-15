<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

// مسارات المشاريع
Route::apiResource('projects', ProjectController::class);

// مسارات المهام
Route::get('tasks/project/{projectId}', [TaskController::class, 'getByProject']);
Route::apiResource('tasks', TaskController::class)->except(['index']);
