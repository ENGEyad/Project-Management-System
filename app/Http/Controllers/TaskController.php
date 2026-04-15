<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // جلب مهام مشروع معين مع دعم الفلترة (Bonus)
    public function getByProject(Request $request, $projectId)
    {
        // استخدام select و orderBy لزيادة السرعة
        $query = Task::select(['id', 'title', 'description', 'status', 'project_id'])
                     ->where('project_id', $projectId);
        
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    // إضافة مهمة جديدة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string', // جعل الوصف مطلوباً بناءً على طلبك
            'project_id' => 'required|exists:projects,id',
            'status' => 'nullable|string'
        ]);

        $task = Task::create($validated);
        return response()->json($task, 201);
    }

    // تعديل مهمة
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->all());
        return response()->json($task);
    }

    // حذف مهمة
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}
