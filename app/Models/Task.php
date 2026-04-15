<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // الحقول التي يمكن تعبئتها
    protected $fillable = ['title', 'description', 'status', 'project_id'];

    // علاقة المهمة بالمشروع (المتعدد للواحد)
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
