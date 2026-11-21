import { useState } from 'react';
import { ContactModal } from './components/ContactModal';
import { Navbar } from './components/Navbar';
import { ScrollStory } from './components/ScrollStory';
import { SolutionsSection } from './components/SolutionsSection';
import type { NavItem } from './data/mosslineData';

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactTopic, setContactTopic] = useState<string | undefined>(undefined);

  const handleOpenContact = (topic?: string) => {
    setContactTopic(topic);
    setContactOpen(true);
  };

  const handleNavigateItem = (item: NavItem) => {
    if (item.targetSelector) {
      const target = document.querySelector(item.targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (typeof item.targetProgress === 'number') {
      const story = document.getElementById('story');
      if (!story) return;
      const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: story.offsetTop + maxScroll * item.targetProgress,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top">
      <Navbar
        onOpenContact={() => handleOpenContact()}
        onNavigateItem={handleNavigateItem}
        onScrollTop={handleScrollTop}
      />

      <main>
        <ScrollStory />
        <SolutionsSection onOpenContact={handleOpenContact} />
      </main>

      <ContactModal
        open={contactOpen}
        initialTopic={contactTopic}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
