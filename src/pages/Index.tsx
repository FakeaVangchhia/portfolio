
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Linkedin, ExternalLink, Code, Brain, Database, Wrench } from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'education', 'skills', 'projects', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="gradient-text text-xl font-bold">LV</div>
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Education', 'Skills', 'Projects', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg ${
                    activeSection === item.toLowerCase()
                      ? 'text-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'text-readable hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden hero-interactive">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 neuron-pulse">
              <span className="gradient-text text-shimmer">Lalfakawma</span>
              <br />
              <span className="text-foreground">Vangchhia</span>
            </h1>
            <p className="text-xl md:text-2xl text-readable mb-8 max-w-3xl mx-auto floating-element font-medium">
              AI & Full-Stack Developer | Turning ideas into intelligent solutions
            </p>
            <p className="text-lg text-readable mb-12 max-w-2xl mx-auto">
              Adaptable team player with a Computer Science background, skilled in AI/ML, 
              Generative AI, and full-stack development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => scrollToSection('projects')}
                className="gradient-bg text-primary-foreground hover:opacity-90 px-8 py-3 text-lg tech-glow floating-element"
              >
                View My Work
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('contact')}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg tech-glow"
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 section-bg">
        <div className="container mx-auto px-6">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-16">
              About <span className="gradient-text">Me</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <Card className="bg-card border-border card-hover tech-glow">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 gradient-text">Career Objective</h3>
                  <p className="text-readable leading-relaxed text-base">
                    Passionate about solving complex problems with precision and building efficient 
                    AI/ML models and scalable applications. I thrive on transforming innovative 
                    ideas into practical, intelligent solutions that make a real difference.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border card-hover tech-glow">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 gradient-text">Core Strengths</h3>
                  <div className="space-y-3">
                    {['Adaptability', 'Active Listening', 'Creativity', 'Multi-tasking'].map((strength) => (
                      <div key={strength} className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50"></div>
                        <span className="label-enhanced text-base">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border card-hover tech-glow md:col-span-2">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 gradient-text">Personal Interests</h3>
                  <div className="flex flex-wrap gap-4">
                    {['Reading', 'Movies', 'Chess'].map((interest) => (
                      <Badge key={interest} className="badge-enhanced px-4 py-2 text-sm floating-element font-medium">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20">
        <div className="container mx-auto px-6">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="gradient-text">Education</span>
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  degree: "M.C.A",
                  institution: "CMR University, Bangalore, Karnataka",
                  achievement: "Advanced Computer Applications"
                },
                {
                  degree: "B.C.A",
                  institution: "Govt. Champhai College, Mizoram",
                  achievement: "Silver Medalist • Valedictorian 2023 • State Silver Medal in Academics"
                },
                {
                  degree: "12th Grade",
                  institution: "Thenzawl Higher Secondary School, Mizoram",
                  achievement: "Higher Secondary Education"
                },
                {
                  degree: "10th Grade",
                  institution: "Vantawng High School, Mizoram",
                  achievement: "Secondary Education"
                }
              ].map((edu, index) => (
                <Card key={index} className="bg-card border-border card-hover tech-glow">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold gradient-text mb-2">{edu.degree}</h3>
                        <p className="text-readable mb-2 text-base font-medium">{edu.institution}</p>
                        <p className="label-enhanced text-sm">{edu.achievement}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 section-bg">
        <div className="container mx-auto px-6">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-16">
              Technical <span className="gradient-text">Skills</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: "AI & ML",
                  skills: ["Machine Learning", "Neural Networks", "Generative AI", "Prompt Engineering", "LLMs"]
                },
                {
                  icon: Database,
                  title: "Backend & Tools",
                  skills: ["Django", "FastAPI", "Docker", "Postman", "Redis"]
                },
                {
                  icon: Wrench,
                  title: "Automation",
                  skills: ["n8n", "Make.com"]
                },
                {
                  icon: Code,
                  title: "Other",
                  skills: ["Full-Stack Development", "API Integration", "CI/CD"]
                }
              ].map((category, index) => (
                <Card key={index} className="bg-card border-border card-hover tech-glow skill-orbit">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <category.icon className="w-8 h-8 text-primary mr-3 floating-element" />
                      <h3 className="text-xl font-semibold gradient-text">{category.title}</h3>
                    </div>
                    <div className="space-y-3">
                      {category.skills.map((skill) => (
                        <div key={skill} className="text-readable hover:text-primary transition-colors cursor-default text-sm font-medium px-2 py-1 rounded hover:bg-primary/10">{skill}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20">
        <div className="container mx-auto px-6">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-16">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Mobile CRM & Business-Card Scanner",
                  description: "React Native + FastAPI + OCR system using OpenCV, Tesseract & PyTorch achieving 95% accuracy in business card data extraction.",
                  tech: ["React Native", "FastAPI", "OpenCV", "PyTorch", "OCR"]
                },
                {
                  title: "Social Media Automation",
                  description: "FastAPI + Redis workers + Docker + CI/CD pipeline for scheduling and batching posts via Facebook Graph API.",
                  tech: ["FastAPI", "Redis", "Docker", "CI/CD", "Facebook API"]
                },
                {
                  title: "Hotel Chawngthu",
                  description: "Django e-commerce & booking platform with PostgreSQL, Stripe integration, and admin dashboard. Increased bookings by 30%.",
                  tech: ["Django", "PostgreSQL", "Stripe", "E-commerce"]
                }
              ].map((project, index) => (
                <Card key={index} className="bg-card border-border card-hover tech-glow group">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 gradient-text group-hover:text-primary transition-colors text-shimmer">
                      {project.title}
                    </h3>
                    <p className="text-readable mb-4 leading-relaxed text-sm">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <Badge key={tech} className="badge-enhanced text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 section-bg">
        <div className="container mx-auto px-6">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-16">
              Get In <span className="gradient-text">Touch</span>
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border tech-glow">
                <CardContent className="p-12 text-center">
                  <p className="text-xl text-readable mb-12 font-medium">
                    Ready to collaborate on innovative AI solutions or discuss exciting opportunities? 
                    Let's connect and build something amazing together.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <a href="tel:8787698473" className="flex flex-col items-center space-y-4 card-hover tech-glow p-6 rounded-lg">
                      <Phone className="w-8 h-8 text-primary floating-element" />
                      <div>
                        <p className="label-enhanced text-lg">Phone</p>
                        <p className="text-readable font-medium">8787698473</p>
                      </div>
                    </a>
                    
                    <a href="mailto:fakeavangchhia@gmail.com" className="flex flex-col items-center space-y-4 card-hover tech-glow p-6 rounded-lg">
                      <Mail className="w-8 h-8 text-primary floating-element" />
                      <div>
                        <p className="label-enhanced text-lg">Email</p>
                        <p className="text-readable font-medium">fakeavangchhia@gmail.com</p>
                      </div>
                    </a>
                    
                    <a href="#" className="flex flex-col items-center space-y-4 card-hover tech-glow p-6 rounded-lg">
                      <Linkedin className="w-8 h-8 text-primary floating-element" />
                      <div>
                        <p className="label-enhanced text-lg">LinkedIn</p>
                        <p className="text-readable font-medium">Connect with me</p>
                      </div>
                    </a>
                  </div>
                  
                  <div className="mt-12">
                    <Button 
                      className="gradient-bg text-primary-foreground hover:opacity-90 px-8 py-3 text-lg tech-glow floating-element"
                      onClick={() => window.open('mailto:fakeavangchhia@gmail.com')}
                    >
                      Start a Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2024 Lalfakawma Vangchhia. Built with passion for innovation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
