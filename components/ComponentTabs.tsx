import React from 'react';

interface Component {
  id: string;
  name: string;
}

interface ComponentTabsProps {
  components: Component[];
  activeTab: string | null;
  setActiveTab: (id: string) => void;
}

const ComponentTabs: React.FC<ComponentTabsProps> = ({ components, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-2">
      {components.map((component) => (
        <button
          key={component.id}
          onClick={() => setActiveTab(component.id)}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === component.id
              ? 'bg-white text-blue-600'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {component.name}
        </button>
      ))}
    </div>
  );
};

export default ComponentTabs;