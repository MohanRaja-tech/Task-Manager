import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Lightbulb,
  Award
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const motivationalQuotes = [
    "Great things are done by a series of small things brought together.",
    "The way to get started is to quit talking and begin doing.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going."
  ];

  const currentQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <motion.div 
      className="sidebar-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Productivity Hero Image */}
      <motion.div variants={itemVariants} className="sidebar-card hero-card">
        <div className="hero-content">
          <motion.div 
            className="hero-icon"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Target className="hero-icon-svg" />
          </motion.div>
          <h3 className="hero-title">Stay Focused</h3>
          <p className="hero-subtitle">Achieve your goals one task at a time</p>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&auto=format" 
            alt="Productivity workspace"
            className="sidebar-image"
          />
        </div>
      </motion.div>

      {/* Team Collaboration */}
      <motion.div variants={itemVariants} className="sidebar-card collaboration-card">
        <div className="card-header">
          <Users className="card-icon" />
          <h4 className="card-title">Team Collaboration</h4>
        </div>
        <div className="collaboration-content">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop&auto=format" 
            alt="Team collaboration"
            className="sidebar-image"
          />
          <p className="card-description">
            Work together seamlessly with your team members
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="sidebar-card stats-card">
        <div className="card-header">
          <TrendingUp className="card-icon" />
          <h4 className="card-title">Quick Tips</h4>
        </div>
        <div className="tips-list">
          <motion.div 
            className="tip-item"
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <Clock className="tip-icon" />
            <span>Use time blocking for better focus</span>
          </motion.div>
          <motion.div 
            className="tip-item"
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <CheckCircle2 className="tip-icon" />
            <span>Break large tasks into smaller ones</span>
          </motion.div>
          <motion.div 
            className="tip-item"
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <Calendar className="tip-icon" />
            <span>Set realistic deadlines</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div variants={itemVariants} className="sidebar-card quote-card">
        <div className="quote-header">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Lightbulb className="quote-icon" />
          </motion.div>
        </div>
        <blockquote className="quote-text">
          "{currentQuote}"
        </blockquote>
      </motion.div>

      {/* Achievement Badge */}
      <motion.div variants={itemVariants} className="sidebar-card achievement-card">
        <div className="achievement-content">
          <motion.div
            className="achievement-badge"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Award className="achievement-icon" />
          </motion.div>
          <h4 className="achievement-title">Keep Going!</h4>
          <p className="achievement-text">Every completed task brings you closer to success</p>
        </div>
      </motion.div>

      {/* Workspace Image */}
      <motion.div variants={itemVariants} className="sidebar-card workspace-card">
        <img 
          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop&auto=format" 
          alt="Modern workspace"
          className="sidebar-image workspace-image"
        />
        <div className="workspace-overlay">
          <h4 className="workspace-title">Your Digital Workspace</h4>
          <p className="workspace-subtitle">Organized • Efficient • Productive</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
