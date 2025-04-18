
import { Layout, Code, Users } from "lucide-react";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
        <Icon className="text-white" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: Layout,
      title: "响应式设计",
      description: "页面自适应各种屏幕尺寸，在手机、平板和桌面设备上都能提供良好的用户体验。",
    },
    {
      icon: Code,
      title: "模块化架构",
      description: "使用组件化开发方式，让您可以轻松添加、修改或移除功能，满足不同需求。",
    },
    {
      icon: Users,
      title: "用户友好",
      description: "简洁直观的界面设计，让用户能够轻松理解和使用您的应用或网站。",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">核心特点</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            这个空白页项目提供了一些基本功能，您可以在此基础上继续构建。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
