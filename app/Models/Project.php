<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    // الحقول التي يمكن تعبئتها
    protected $fillable = ['name', 'description'];

    // علاقة المشروع بالمهام (الواحد للمتعدد)
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
