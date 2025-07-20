import { useState, useEffect } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { Channel } from "@/types/course";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const channelsRef = ref(database, 'channels');
    
    const unsubscribe = onValue(channelsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const channelsArray = Object.entries(data).map(([id, channel]: [string, any]) => {
            // Generate marketing elements once and save them permanently
            const marketingElements = {
              likes: channel.likes || Math.floor(Math.random() * 500) + 100,
              comments: channel.comments || Math.floor(Math.random() * 100) + 20,
              rating: channel.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
              soldCount: channel.soldCount || Math.floor(Math.random() * 1000) + 500,
              fakePrice: channel.fakePrice || Math.floor(channel.price * (2 + Math.random() * 1.5)),
              followerCount: channel.followerCount || Math.floor(Math.random() * 100000) + 10000,
              engagementRate: channel.engagementRate || (Math.random() * 8 + 2).toFixed(1)
            };
            
            // Update the channel with marketing elements if they don't exist
            if (!channel.likes) {
              update(ref(database, `channels/${id}`), marketingElements);
            }
            
            return {
              id,
              ...channel,
              ...marketingElements
            };
          }).filter((channel: any) => {
            // Show only approved/active channels that are not blocked
            return (channel.approvalStatus === 'approved' || channel.status === 'active') && !channel.blocked;
          });
          setChannels(channelsArray);
        } else {
          setChannels([]);
        }
      } catch (error) {
        console.error('Error loading channels:', error);
        setChannels([]);
      }
      setLoading(false);
    });

    return () => off(channelsRef, 'value', unsubscribe);
  }, []);

  const updateChannelInteraction = async (channelId: string, field: 'likes' | 'comments', increment: number = 1) => {
    try {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        await update(ref(database, `channels/${channelId}`), {
          [field]: (channel[field] || 0) + increment
        });
      }
    } catch (error) {
      console.error('Error updating channel interaction:', error);
      throw error;
    }
  };

  return {
    channels,
    loading,
    updateChannelInteraction
  };
}

// Backward compatibility export
export function useCourses() {
  const { channels, loading, updateChannelInteraction } = useChannels();
  return {
    courses: channels,
    loading,
    updateCourseInteraction: updateChannelInteraction
  };
}

// Export for default import compatibility
export { useChannels as default };
