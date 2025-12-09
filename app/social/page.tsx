'use client'

import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SocialPage() {
  const { tasks, loading, addTask, toggleTask } = useTasks()
  const [newTask, setNewTask] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    try {
      await addTask(newTask)
      setNewTask('')
    } catch (error) {
      console.error(error)
      // If auth error, handle it.
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pendientes de Casa</h1>
      
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="Ej: Sacar la basura" 
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2">
         {tasks.map(task => (
           <Card key={task.id} className={cn("transition-colors", task.status === 'done' ? "bg-muted/50" : "")}>
             <CardContent className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id, task.status || 'pending')}>
               {task.status === 'done' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
               <span className={cn("flex-1", task.status === 'done' && "line-through text-muted-foreground")}>
                 {task.title}
               </span>
             </CardContent>
           </Card>
         ))}
         {!loading && tasks.length === 0 && (
           <p className="text-center text-muted-foreground py-8">No hay tareas pendientes</p>
         )}
      </div>
    </div>
  )
}
