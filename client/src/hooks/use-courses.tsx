import { useState, useEffect } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Course } from "@/types/course";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const coursesArray = Object.entries(data).map(([id, course]: [string, any]) => {
            // Generate marketing elements once and save them permanently
            const marketingElements = {
              likes: course.likes || Math.floor(Math.random() * 500) + 100,
              comments: course.comments || Math.floor(Math.random() * 100) + 20,
              rating: course.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
              soldCount: course.soldCount || Math.floor(Math.random() * 1000) + 500,
              fakePrice: course.fakePrice || Math.floor(course.price * (2 + Math.random() * 1.5))
            };
            
            // Update the course with marketing elements if they don't exist
            if (!course.likes) {
              update(ref(database, `courses/${id}`), marketingElements);
            }
            
            return {
              id,
              ...course,
              ...marketingElements
            };
          }).filter((course: any) => {
            // Show only approved/active courses that are not blocked
            return (course.approvalStatus === 'approved' || course.status === 'active') && !course.blocked;
          });
          setCourses(coursesArray);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      }
      setLoading(false);
    });

    return () => off(coursesRef, 'value', unsubscribe);
  }, []);

  const updateCourseInteraction = async (courseId: string, field: 'likes' | 'comments', increment: number = 1) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        await update(ref(database, `courses/${courseId}`), {
          [field]: (course[field] || 0) + increment
        });
      }
    } catch (error) {
      console.error('Error updating course interaction:', error);
      throw error;
    }
  };

  return {
    courses,
    loading,
    updateCourseInteraction
  };
}
