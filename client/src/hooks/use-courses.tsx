import { useState, useEffect } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Service } from "@/types/course";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesRef = ref(database, 'services');
    
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const servicesArray = Object.entries(data).map(([id, service]: [string, any]) => {
            // Generate marketing elements once and save them permanently
            const marketingElements = {
              likes: service.likes || Math.floor(Math.random() * 500) + 100,
              comments: service.comments || Math.floor(Math.random() * 100) + 20,
              rating: service.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
              soldCount: service.soldCount || Math.floor(Math.random() * 1000) + 500,
              fakePrice: service.fakePrice || Math.floor(service.price * (2 + Math.random() * 1.5)),
              followerCount: service.followerCount || Math.floor(Math.random() * 100000) + 10000,
              engagementRate: service.engagementRate || (Math.random() * 8 + 2).toFixed(1)
            };
            
            // Update the service with marketing elements if they don't exist
            if (!service.likes) {
              update(ref(database, `services/${id}`), marketingElements);
            }
            
            return {
              id,
              ...service,
              ...marketingElements
            };
          }).filter((service: any) => {
            // Show only approved/active services that are not blocked
            return (service.approvalStatus === 'approved' || service.status === 'active') && !service.blocked;
          });
          setServices(servicesArray);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        setServices([]);
      }
      setLoading(false);
    });

    return () => off(servicesRef, 'value', unsubscribe);
  }, []);

  const updateServiceInteraction = async (serviceId: string, field: 'likes' | 'comments', increment: number = 1) => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        await update(ref(database, `services/${serviceId}`), {
          [field]: (service[field] || 0) + increment
        });
      }
    } catch (error) {
      console.error('Error updating service interaction:', error);
      throw error;
    }
  };

  return {
    services,
    loading,
    updateServiceInteraction
  };
}

// Backward compatibility exports
export function useChannels() {
  const { services, loading, updateServiceInteraction } = useServices();
  return {
    channels: services,
    loading,
    updateChannelInteraction: updateServiceInteraction
  };
}

export function useCourses() {
  const { services, loading, updateServiceInteraction } = useServices();
  return {
    courses: services,
    loading,
    updateCourseInteraction: updateServiceInteraction
  };
}

// Export for default import compatibility
export { useServices as default };
