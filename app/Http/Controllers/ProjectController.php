<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // جلب كل المشاريع مع عدد المهام (Bonus)
    public function index()
    {
        // جلب الحقول الأساسية فقط مع حساب المهام لزيادة سرعة التحميل
        return response()->json(Project::select(['id', 'name', 'description'])
            ->withCount([
                'tasks', 
                'tasks as completed_tasks_count' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->latest()
            ->get());
    }

    // إضافة مشروع جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project = Project::create($validated);
        return response()->json($project, 201);
    }

    // تعديل مشروع
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($request->all());
        return response()->json($project);
    }

    // حذف مشروع
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }
}
