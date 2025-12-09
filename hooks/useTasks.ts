import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'

type Task = Database['public']['Tables']['communal_tasks']['Row']

export function useTasks() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'communal_tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => [payload.new as Task, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((task) => (task.id === payload.new.id ? (payload.new as Task) : task)))
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('communal_tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data || [])
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (title: string) => {
    // Mock user for now if auth not fully implemented or user manual entry
    // Ideally use session user.
    // For this MVP, if no user is logged in, we might fail or insert with a placeholder if RLS allows.
    // Assuming user is logged in via Supabase Auth UI?
    // User request Plan said: "Backend/BaaS: Supabase (Auth...)"
    // I haven't implemented Auth UI (Login page).
    // I need to implement a basic Login or Anonymous login if the user hasn't yet.
    // But for now, let's try to get user.
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        // Fallback for demo: Sign in anonymously if permitted or prompt.
        // Or assume the user will sign in.
        // Let's implement a quick check in the UI.
        alert("Debes iniciar sesión para agregar tareas.")
        return
    }

    // @ts-ignore
    const { error } = await supabase.from('communal_tasks').insert([{ 
        title, 
        created_by: user.id,
        is_public: true 
    } as any])
    if (error) throw error
  }

  const toggleTask = async (id: number, currentStatus: 'pending' | 'done' | string) => {
     const newStatus: 'pending' | 'done' = currentStatus === 'done' ? 'pending' : 'done'
     // @ts-ignore
     await supabase.from('communal_tasks').update({ status: newStatus }).eq('id', id)
  }

  return { tasks, loading, addTask, toggleTask }
}
