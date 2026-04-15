<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // إيقاف مراجعة القيود لزيادة السرعة القصوى
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Project::truncate();
        Task::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $batchSize = 500; // حجم الدفعة الواحدة لتقليل الضغط
        $totalProjects = 3000;

        echo "🚀 يتم الآن توليد $totalProjects مشروع مع مهامهم... يرجى الانتظار قليلاً.\n";

        for ($i = 0; $i < $totalProjects; $i += $batchSize) {
            $projectsData = [];
            for ($j = 0; $j < $batchSize; $j++) {
                $id = ($i + $j + 1);
                $projectsData[] = [
                    'id' => $id,
                    'name' => "مشروع استراتيجي رقم " . ($id),
                    'description' => "وصف تفصيلي للمشروع رقم " . ($id) . ". هذا المشروع يهدف لتحقيق أهداف الشركة المستقبلية.",
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('projects')->insert($projectsData);

            // إضافة مهام عشوائية لكل دفعة مشاريع
            $tasksData = [];
            foreach ($projectsData as $project) {
                $tasksCount = rand(5, 25);
                for ($k = 1; $k <= $tasksCount; $k++) {
                    $tasksData[] = [
                        'project_id' => $project['id'],
                        'title' => "مهمة تنفيذية $k للمشروع " . $project['id'],
                        'description' => "شرح فني للمهمة رقم $k المطلوبة لإنجاز المشروع بنجاح.",
                        'status' => ['pending', 'in_progress', 'completed'][rand(0, 2)],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                
                // إدخال المهام كلما وصلت المصفوفة لحجم معين لتفادي استهلاك الذاكرة
                if (count($tasksData) > 2000) {
                    DB::table('tasks')->insert($tasksData);
                    $tasksData = [];
                }
            }
            if (!empty($tasksData)) {
                DB::table('tasks')->insert($tasksData);
            }
            
            echo "✅ تم إنجاز " . ($i + $batchSize) . " مشروع...\n";
        }

        echo "✨ اكتملت العملية بنجاح! قاعدة البيانات الآن تحتوي على ضخامة من البيانات للاختبار.\n";
    }
}
