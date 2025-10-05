import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, Timer } from 'lucide-react';
import { taskService } from '../../services/taskService';
import './TaskTimer.css';

const TaskTimer = ({ task, onTaskUpdate }) => {
  const [isRunning, setIsRunning] = useState(task.isActive || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Format time in HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  // Update timer display
  useEffect(() => {
    let interval = null;
    
    if (isRunning && task.startedAt) {
      interval = setInterval(() => {
        const startTime = new Date(task.startedAt).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const totalTime = (task.timeSpent || 0) + elapsed;
        setCurrentTime(totalTime);
      }, 1000);
    } else {
      setCurrentTime(task.timeSpent || 0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, task.startedAt, task.timeSpent]);

    // Start timer
  const handleStartTimer = async () => {
    try {
      setLoading(true);
      console.log('Starting timer for task:', task._id || task.id);
      
      const response = await taskService.startTaskTimer(task._id || task.id);
      console.log('Start timer response:', response);
      
      if (response && (response.success || response.data)) {
        setIsRunning(true);
        // Update the task with new data
        const updatedTask = {
          ...task,
          isActive: true,
          startedAt: (response.data && response.data.startedAt) || new Date().toISOString()
        };
        
        if (onTaskUpdate) {
          onTaskUpdate(updatedTask);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      alert(`Failed to start timer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stop timer
  const handleStopTimer = async () => {
    try {
      setLoading(true);
      console.log('Stopping timer for task:', task._id || task.id);
      
      const response = await taskService.stopTaskTimer(task._id || task.id);
      console.log('Stop timer response:', response);
      
      if (response && (response.success || response.data)) {
        setIsRunning(false);
        // Update the task with new data
        const updatedTask = {
          ...task,
          isActive: false,
          timeSpent: (response.data && response.data.timeSpent) || currentTime,
          startedAt: null
        };
        
        if (onTaskUpdate) {
          onTaskUpdate(updatedTask);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      // Show detailed error to user
      alert(`Failed to stop timer: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const totalTimeSpent = task.timeSpent || 0;

  return (
    <div className="task-timer">
      {/* Timer Display */}
      <div className="timer-display">
        <div className="timer-current">
          <Clock className="h-4 w-4" />
          <span className="timer-text">
            {isRunning ? formatTime(currentTime) : formatTime(totalTimeSpent)}
          </span>
          {isRunning && <span className="timer-status running">Running</span>}
        </div>
        
        {totalTimeSpent > 0 && (
          <div className="timer-total">
            <Timer className="h-4 w-4" />
            <span className="timer-label">Total: {formatDuration(totalTimeSpent)}</span>
          </div>
        )}
      </div>

      {/* Timer Controls */}
      <div className="timer-controls">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartTimer}
            disabled={loading || task.status === 'completed'}
            className="timer-btn start"
            title="Start timer"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Starting...' : 'Start'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStopTimer}
            disabled={loading}
            className="timer-btn stop"
            title="Stop timer"
          >
            <Pause className="h-4 w-4" />
            {loading ? 'Stopping...' : 'Stop'}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default TaskTimer;