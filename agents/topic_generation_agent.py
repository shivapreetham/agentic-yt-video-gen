"""
Topic Generation Agent
Automatically generates relevant topics using Gemini AI based on given domains
"""

import os
import json
import random
import time
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass

@dataclass
class GeneratedTopic:
    """Represents a generated topic"""
    topic: str
    domain: str
    subtopics: List[str]
    estimated_interest: float
    keywords: List[str]
    generated_at: datetime
    used: bool = False

class TopicGenerationAgent:
    """
    Autonomous agent that generates topics using Gemini AI based on domains
    """
    
    def __init__(self):
        # Initialize Gemini
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.use_gemini = True
        else:
            print("[TOPIC AGENT] Warning: GEMINI_API_KEY not found, using fallback templates")
            self.model = None
            self.use_gemini = False
        
        # Fallback topic templates for when Gemini is not available
        self.topic_templates = {
            "indian_mythology": [
                "The untold story of {character} and their journey",
                "Secret meanings behind {ritual} in ancient times",
                "How {deity} influenced modern {aspect}",
                "The connection between {place} and {myth}",
                "Ancient wisdom of {text} for modern life",
                "The symbolism of {symbol} in Hindu culture",
                "Epic battles: {character} vs {opponent}",
                "The spiritual significance of {festival}",
                "Hidden powers of {weapon} in mythology",
                "Love stories from ancient India: {story}"
            ],
            "technology": [
                "How {tech} is changing {industry}",
                "The future of {field} with {innovation}",
                "Why {company} is leading in {sector}",
                "Breaking: New developments in {area}",
                "The impact of {technology} on {society_aspect}",
                "Revolutionary {product} that could change everything",
                "Hidden dangers of {tech_trend}",
                "Success story: How {startup} disrupted {market}",
                "The science behind {innovation}",
                "Predictions: {field} in the next decade"
            ],
            "science": [
                "Breakthrough discovery in {field}",
                "How {phenomenon} affects {subject}",
                "The mystery of {topic} finally solved",
                "New research reveals {finding}",
                "The connection between {thing1} and {thing2}",
                "What scientists found about {subject}",
                "Incredible facts about {natural_phenomenon}",
                "The evolution of {species_or_concept}",
                "Why {scientific_fact} matters for humanity",
                "Exploring the depths of {scientific_area}"
            ],
            "history": [
                "The untold story of {historical_event}",
                "How {historical_figure} changed {field}",
                "Secrets of {ancient_civilization}",
                "The real reason behind {historical_event}",
                "Lost knowledge of {historical_period}",
                "What {culture} taught us about {concept}",
                "The rise and fall of {empire_or_kingdom}",
                "Hidden facts about {famous_person}",
                "How {invention} changed the world",
                "The mystery of {historical_mystery}"
            ],
            "health": [
                "Natural ways to improve {health_aspect}",
                "The truth about {health_trend}",
                "How {lifestyle_factor} affects {body_system}",
                "Ancient remedies for modern {condition}",
                "The science of {health_practice}",
                "Why {food_or_herb} is a superfood",
                "Mental health: Understanding {condition}",
                "The connection between {factor1} and {factor2}",
                "Simple habits for better {health_goal}",
                "Debunking myths about {health_topic}"
            ],
            "business": [
                "How {company} became a {industry} leader",
                "The psychology of {business_concept}",
                "Why {business_strategy} works",
                "The future of {industry}",
                "Success lessons from {entrepreneur}",
                "How {trend} is reshaping {market}",
                "The rise of {business_model}",
                "What {failure} taught the business world",
                "The economics of {phenomenon}",
                "How to succeed in {field}"
            ],
            "entertainment": [
                "The hidden meaning behind {anime_series}",
                "Why {character} is the best {character_type}",
                "The evolution of {animation_studio}",
                "Top {number} {genre} anime you must watch",
                "The cultural impact of {popular_anime}",
                "How {anime} changed the industry",
                "The story behind creating {famous_anime}",
                "Why {anime_movie} is a masterpiece",
                "The philosophy of {anime_character}",
                "Anime vs Reality: {real_world_concept}"
            ]
        }
        
        # Domain-specific variables for template filling
        self.domain_variables = {
            "indian_mythology": {
                "character": ["Hanuman", "Arjuna", "Krishna", "Rama", "Draupadi", "Bhima", "Ganesha"],
                "ritual": ["Yajna", "Puja", "Sandhya Vandana", "Pradakshina", "Aarti"],
                "deity": ["Shiva", "Vishnu", "Durga", "Lakshmi", "Saraswati", "Ganesha"],
                "aspect": ["leadership", "relationships", "spirituality", "success", "wisdom"],
                "place": ["Vrindavan", "Ayodhya", "Kashi", "Dwarka", "Kurukshetra"],
                "myth": ["Ramayana", "Mahabharata", "Puranas", "Vedic stories"],
                "text": ["Bhagavad Gita", "Ramayana", "Upanishads", "Vedas"],
                "symbol": ["Om", "Swastika", "Lotus", "Conch", "Trishul"],
                "opponent": ["Ravana", "Mahishasura", "Kansa", "Duryodhana"],
                "festival": ["Diwali", "Holi", "Navaratri", "Dussehra", "Janmashtami"],
                "weapon": ["Sudarshan Chakra", "Gada", "Trishul", "Bow of Arjuna"],
                "story": ["Radha Krishna", "Shiva Parvati", "Rama Sita"]
            },
            "technology": {
                "tech": ["AI", "Blockchain", "IoT", "5G", "VR", "AR", "Quantum Computing"],
                "industry": ["healthcare", "finance", "education", "entertainment", "retail"],
                "field": ["machine learning", "cybersecurity", "robotics", "biotechnology"],
                "innovation": ["neural networks", "gene editing", "renewable energy", "space tech"],
                "company": ["Google", "Tesla", "Microsoft", "Apple", "Meta", "OpenAI"],
                "sector": ["autonomous vehicles", "cloud computing", "fintech", "medtech"],
                "area": ["artificial intelligence", "quantum physics", "nanotechnology"],
                "technology": ["machine learning", "blockchain", "IoT", "5G networks"],
                "society_aspect": ["privacy", "jobs", "communication", "healthcare"],
                "product": ["smartphone", "electric car", "AI assistant", "VR headset"],
                "tech_trend": ["social media", "cryptocurrency", "AI automation"],
                "startup": ["OpenAI", "Neuralink", "SpaceX", "Stripe"],
                "market": ["transportation", "finance", "healthcare", "education"]
            },
            "science": {
                "field": ["neuroscience", "quantum physics", "marine biology", "astronomy"],
                "phenomenon": ["black holes", "climate change", "genetic mutations", "gravity"],
                "subject": ["human brain", "ocean currents", "planetary formation", "evolution"],
                "topic": ["dark matter", "consciousness", "origin of life", "time travel"],
                "finding": ["new species", "gravitational waves", "brain plasticity"],
                "thing1": ["sleep", "exercise", "stress", "nutrition"],
                "thing2": ["longevity", "memory", "immunity", "creativity"],
                "natural_phenomenon": ["aurora", "earthquakes", "photosynthesis", "migration"],
                "species_or_concept": ["human intelligence", "plant communication", "animal behavior"],
                "scientific_fact": ["quantum entanglement", "DNA repair", "neuroplasticity"],
                "scientific_area": ["deep ocean", "space", "human genome", "quantum realm"]
            },
            "history": {
                "historical_event": ["World War II", "Renaissance", "Industrial Revolution", "Ancient Egypt"],
                "historical_figure": ["Leonardo da Vinci", "Napoleon", "Cleopatra", "Genghis Khan"],
                "ancient_civilization": ["Maya", "Roman Empire", "Indus Valley", "Greek civilization"],
                "historical_period": ["Medieval times", "Ancient Greece", "Victorian era", "Stone Age"],
                "culture": ["Ancient Greeks", "Vikings", "Samurai", "Egyptians"],
                "concept": ["democracy", "medicine", "architecture", "philosophy"],
                "empire_or_kingdom": ["Roman Empire", "Mongol Empire", "British Empire", "Ottoman Empire"],
                "famous_person": ["Julius Caesar", "Alexander the Great", "Einstein", "Churchill"],
                "invention": ["printing press", "wheel", "electricity", "internet"],
                "historical_mystery": ["Stonehenge", "Atlantis", "Bermuda Triangle", "Easter Island"]
            },
            "health": {
                "health_aspect": ["sleep quality", "mental clarity", "immune system", "energy levels"],
                "health_trend": ["intermittent fasting", "cold therapy", "meditation", "plant-based diet"],
                "lifestyle_factor": ["stress", "exercise", "diet", "sleep"],
                "body_system": ["nervous system", "immune system", "digestive system", "cardiovascular system"],
                "condition": ["anxiety", "insomnia", "back pain", "digestive issues"],
                "food_or_herb": ["turmeric", "ginger", "garlic", "green tea", "salmon"],
                "health_practice": ["yoga", "meditation", "acupuncture", "massage therapy"],
                "factor1": ["gut health", "stress levels", "sleep quality", "exercise"],
                "factor2": ["mental health", "immunity", "longevity", "brain function"],
                "health_goal": ["heart health", "weight management", "mental clarity", "longevity"],
                "health_topic": ["detox diets", "supplements", "fitness trends", "mental health"]
            },
            "business": {
                "company": ["Apple", "Amazon", "Tesla", "Google", "Microsoft", "Netflix"],
                "industry": ["tech", "automotive", "retail", "entertainment", "finance"],
                "business_concept": ["marketing", "leadership", "innovation", "customer service"],
                "business_strategy": ["disruption", "diversification", "focus", "partnership"],
                "entrepreneur": ["Elon Musk", "Steve Jobs", "Bill Gates", "Jeff Bezos"],
                "trend": ["remote work", "AI automation", "sustainability", "digital transformation"],
                "market": ["e-commerce", "streaming", "electric vehicles", "cloud computing"],
                "business_model": ["subscription", "platform", "freemium", "marketplace"],
                "failure": ["Blockbuster", "Kodak", "Nokia", "BlackBerry"],
                "phenomenon": ["viral marketing", "network effects", "economies of scale"],
                "field": ["startups", "e-commerce", "fintech", "social media"]
            },
            "entertainment": {
                "anime_series": ["Naruto", "One Piece", "Dragon Ball", "Attack on Titan", "Death Note", "Demon Slayer", "My Hero Academia", "Fullmetal Alchemist"],
                "character": ["Goku", "Naruto", "Luffy", "Eren Yeager", "Edward Elric", "Tanjiro", "All Might", "Levi Ackerman"],
                "character_type": ["protagonist", "villain", "anti-hero", "mentor", "sidekick"],
                "animation_studio": ["Studio Ghibli", "Madhouse", "Toei Animation", "Pierrot", "Bones", "Ufotable", "Mappa"],
                "number": ["5", "10", "15", "20", "25"],
                "genre": ["shonen", "seinen", "slice of life", "romance", "horror", "mecha", "isekai"],
                "popular_anime": ["Spirited Away", "Princess Mononoke", "Akira", "Ghost in the Shell", "Cowboy Bebop"],
                "anime": ["Dragon Ball", "Naruto", "One Piece", "Attack on Titan", "Demon Slayer"],
                "famous_anime": ["Spirited Away", "My Neighbor Totoro", "Akira", "Ghost in the Shell"],
                "anime_movie": ["Spirited Away", "Princess Mononoke", "Your Name", "Weathering with You", "Akira"],
                "anime_character": ["Hayao Miyazaki", "Akira Toriyama", "Masashi Kishimoto", "Eiichiro Oda"],
                "real_world_concept": ["Japanese culture", "martial arts", "friendship", "perseverance", "honor"]
            }
        }
        
    def generate_topics_for_domain(self, domain: str, count: int = 10) -> List[GeneratedTopic]:
        """Generate topics for a specific domain using Gemini AI"""
        if self.use_gemini and self.model:
            return self._generate_topics_with_gemini(domain, count)
        else:
            return self._generate_topics_with_templates(domain, count)

    def _generate_topics_with_gemini(self, domain: str, count: int = 10) -> List[GeneratedTopic]:
        """Generate topics using Gemini AI"""
        try:
            prompt = f"""
            Generate {count} engaging and interesting video topics for the domain: {domain}

            Requirements:
            1. Each topic should be suitable for a 3-5 minute video
            2. Topics should be engaging and have viral potential
            3. Focus on lesser-known facts, stories, or angles
            4. Make them educational yet entertaining
            5. Return as a JSON array with this structure:
            [
                {{
                    "topic": "The complete topic title",
                    "subtopics": ["subtopic1", "subtopic2", "subtopic3"],
                    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
                    "estimated_interest": 0.8
                }}
            ]

            Domain context:
            - indian_mythology: Ancient Indian stories, gods, epics, spiritual wisdom
            - technology: Latest tech trends, innovations, AI, startups, gadgets
            - science: Scientific discoveries, phenomena, research findings
            - history: Historical events, figures, mysteries, civilizations
            - health: Wellness, nutrition, mental health, fitness, medical breakthroughs
            - business: Success stories, strategies, market trends, entrepreneurship

            Generate creative and compelling topics for: {domain}
            """

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                # Try to find JSON array in response
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_text = response_text[start_idx:end_idx]
                else:
                    raise ValueError("No valid JSON found in response")

            topics_data = json.loads(json_text)
            
            topics = []
            for topic_data in topics_data:
                topic = GeneratedTopic(
                    topic=topic_data.get('topic', ''),
                    domain=domain,
                    subtopics=topic_data.get('subtopics', []),
                    estimated_interest=topic_data.get('estimated_interest', 0.7),
                    keywords=topic_data.get('keywords', []),
                    generated_at=datetime.now()
                )
                topics.append(topic)
            
            print(f"[TOPIC AGENT] Generated {len(topics)} topics for {domain} using Gemini")
            return topics[:count]  # Ensure we don't exceed requested count
            
        except Exception as e:
            print(f"[TOPIC AGENT] Error using Gemini for {domain}: {e}")
            print(f"[TOPIC AGENT] Falling back to template-based generation")
            return self._generate_topics_with_templates(domain, count)

    def _generate_topics_with_templates(self, domain: str, count: int = 10) -> List[GeneratedTopic]:
        """Generate topics using fallback templates"""
        if domain not in self.topic_templates:
            return self._generate_fallback_topics(domain, count)
        
        # Check if this should be a sequential series
        if domain == 'indian_mythology':
            return self._generate_mythology_series(count)
        elif domain == 'entertainment':
            return self._generate_anime_series(count)
        
        # Default random topic generation for other domains
        topics = []
        templates = self.topic_templates[domain]
        variables = self.domain_variables.get(domain, {})
        
        for _ in range(count):
            template = random.choice(templates)
            filled_template = self._fill_template(template, variables)
            
            topic = GeneratedTopic(
                topic=filled_template,
                domain=domain,
                subtopics=self._generate_subtopics(filled_template, domain),
                estimated_interest=random.uniform(0.6, 1.0),
                keywords=self._extract_keywords(filled_template),
                generated_at=datetime.now()
            )
            topics.append(topic)
        
        return topics

    def generate_topics_from_high_level(self, high_level_topic: str, count: int = 5) -> List[GeneratedTopic]:
        """Generate specific video topics from a high-level topic using Gemini"""
        if self.use_gemini and self.model:
            return self._generate_from_high_level_with_gemini(high_level_topic, count)
        else:
            # Fallback: categorize the high-level topic into a domain
            domain = self._categorize_high_level_topic(high_level_topic)
            return self._generate_topics_with_templates(domain, count)

    def _generate_from_high_level_with_gemini(self, high_level_topic: str, count: int = 5) -> List[GeneratedTopic]:
        """Use Gemini to break down high-level topic into specific video topics"""
        try:
            prompt = f"""
            Take this high-level topic: "{high_level_topic}"
            
            Create a SEQUENTIAL SERIES of {count} video episodes that tell the story chronologically from beginning to end.
            
            Requirements:
            1. Episodes should follow chronological order (Part 1, Part 2, etc.)
            2. Each episode covers a distinct phase/section with NO OVERLAP
            3. Together they should cover the entire story/topic comprehensively
            4. Each episode should be 3-5 minutes of engaging content
            5. Make titles that indicate the sequence (e.g., "Part 1: The Beginning", "Episode 2: The Conflict Begins")
            
            For epics like Mahabharata/Ramayana:
            - Start from the very beginning (origins, births, early events)
            - Progress chronologically through major phases
            - Each episode should cover distinct events/periods
            - Avoid overlapping content between episodes
            
            For anime series:
            - Follow the canonical story order
            - Each episode covers specific arcs/seasons
            - Progress through the complete storyline
            
            For historical topics:
            - Follow chronological timeline
            - Each episode covers a distinct time period
            - Progress from earliest to latest events
            
            Return as a JSON array with this structure:
            [
                {{
                    "topic": "Episode/Part title with sequence indicator",
                    "domain": "categorized_domain",
                    "subtopics": ["specific_events_covered", "key_characters", "major_outcomes"],
                    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
                    "estimated_interest": 0.8,
                    "episode_number": 1,
                    "chronological_order": "brief description of what this episode covers in the sequence"
                }}
            ]
            
            Domains to categorize into: indian_mythology, technology, science, history, health, business, entertainment, lifestyle
            
            Generate {count} SEQUENTIAL episodes for: {high_level_topic}
            """

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_text = response_text[start_idx:end_idx]
                else:
                    raise ValueError("No valid JSON found in response")

            topics_data = json.loads(json_text)
            
            topics = []
            for topic_data in topics_data:
                topic = GeneratedTopic(
                    topic=topic_data.get('topic', ''),
                    domain=topic_data.get('domain', 'general'),
                    subtopics=topic_data.get('subtopics', []),
                    estimated_interest=topic_data.get('estimated_interest', 0.7),
                    keywords=topic_data.get('keywords', []),
                    generated_at=datetime.now()
                )
                topics.append(topic)
            
            print(f"[TOPIC AGENT] Generated {len(topics)} topics from high-level topic '{high_level_topic}' using Gemini")
            return topics[:count]
            
        except Exception as e:
            print(f"[TOPIC AGENT] Error using Gemini for high-level topic '{high_level_topic}': {e}")
            print(f"[TOPIC AGENT] Raw response text: {response.text if 'response' in locals() else 'No response generated'}")
            # Fallback to template-based generation
            domain = self._categorize_high_level_topic(high_level_topic)
            print(f"[TOPIC AGENT] Falling back to template-based generation for domain: {domain}")
            return self._generate_topics_with_templates(domain, count)

    def _categorize_high_level_topic(self, high_level_topic: str) -> str:
        """Categorize a high-level topic into a domain for fallback"""
        topic_lower = high_level_topic.lower()
        
        # More comprehensive keyword matching
        if any(keyword in topic_lower for keyword in ['mythology', 'hindu', 'indian', 'epic', 'god', 'spiritual', 'mahabharata', 'ramayana', 'krishna', 'rama', 'dharma', 'karma', 'vedic', 'sanskrit']):
            return 'indian_mythology'
        elif any(keyword in topic_lower for keyword in ['tech', 'ai', 'computer', 'software', 'digital', 'innovation', 'programming', 'coding', 'robot', 'automation']):
            return 'technology'
        elif any(keyword in topic_lower for keyword in ['anime', 'manga', 'japanese', 'otaku', 'naruto', 'dragon ball', 'one piece', 'attack on titan', 'demon slayer', 'studio ghibli']):
            return 'entertainment'
        elif any(keyword in topic_lower for keyword in ['science', 'research', 'discovery', 'physics', 'chemistry', 'biology', 'space', 'universe', 'dna', 'quantum']):
            return 'science'
        elif any(keyword in topic_lower for keyword in ['history', 'historical', 'ancient', 'past', 'civilization', 'war', 'empire', 'culture', 'tradition']):
            return 'history'
        elif any(keyword in topic_lower for keyword in ['health', 'fitness', 'nutrition', 'medical', 'wellness', 'diet', 'exercise', 'mental']):
            return 'health'
        elif any(keyword in topic_lower for keyword in ['business', 'startup', 'entrepreneur', 'company', 'market', 'finance', 'investment', 'economy']):
            return 'business'
        else:
            return 'general'
    
    def _fill_template(self, template: str, variables: Dict[str, List[str]]) -> str:
        """Fill template with random variables"""
        filled = template
        for var_name, var_values in variables.items():
            if f"{{{var_name}}}" in filled:
                filled = filled.replace(f"{{{var_name}}}", random.choice(var_values))
        return filled
    
    def _generate_subtopics(self, main_topic: str, domain: str) -> List[str]:
        """Generate related subtopics"""
        # Simple subtopic generation based on domain
        base_subtopics = {
            "indian_mythology": ["historical context", "spiritual meaning", "cultural impact", "modern relevance"],
            "technology": ["current trends", "future implications", "benefits", "challenges"],
            "science": ["research findings", "practical applications", "implications", "future research"],
            "history": ["timeline", "key figures", "consequences", "lessons learned"],
            "health": ["symptoms", "causes", "treatments", "prevention"],
            "business": ["case studies", "strategies", "market impact", "lessons"],
            "entertainment": ["plot analysis", "character development", "cultural significance", "fan theories"]
        }
        
        domain_subtopics = base_subtopics.get(domain, ["overview", "details", "implications", "conclusion"])
        return random.sample(domain_subtopics, min(3, len(domain_subtopics)))
    
    def _extract_keywords(self, topic: str) -> List[str]:
        """Extract keywords from topic"""
        # Simple keyword extraction
        stop_words = {"the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "how", "why", "what"}
        words = topic.lower().replace(".", "").replace(",", "").split()
        keywords = [word for word in words if len(word) > 3 and word not in stop_words]
        return keywords[:5]
    
    def _generate_fallback_topics(self, domain: str, count: int) -> List[GeneratedTopic]:
        """Generate fallback topics for unknown domains"""
        fallback_templates = [
            f"Introduction to {domain}",
            f"The future of {domain}",
            f"Top trends in {domain}",
            f"Understanding {domain} better",
            f"The importance of {domain}",
            f"How {domain} affects our daily lives",
            f"Key concepts in {domain}",
            f"The evolution of {domain}",
            f"Why {domain} matters",
            f"Exploring {domain} in depth"
        ]
        
        topics = []
        for i in range(min(count, len(fallback_templates))):
            topic = GeneratedTopic(
                topic=fallback_templates[i],
                domain=domain,
                subtopics=["overview", "importance", "applications"],
                estimated_interest=0.7,
                keywords=[domain, "introduction", "overview"],
                generated_at=datetime.now()
            )
            topics.append(topic)
        
        return topics
    
    def _generate_mythology_series(self, count: int = 5) -> List[GeneratedTopic]:
        """Generate sequential Mahabharata/Ramayana episodes"""
        mahabharata_episodes = [
            "Part 1: The Origins - Birth of the Kuru and Pandu Dynasties",
            "Part 2: The Princes' Youth - Education in Hastinapura", 
            "Part 3: The Great Game of Dice - Draupadi's Humiliation",
            "Part 4: The Forest Exile - 13 Years of Hardship",
            "Part 5: The War Begins - Kurukshetra's First Day",
            "Part 6: Bhishma Falls - The Grandfather's Last Stand",
            "Part 7: Drona's Death - The Teacher's Final Battle",
            "Part 8: Karna vs Arjuna - The Ultimate Warrior Confrontation", 
            "Part 9: The Final Victory - End of the Great War",
            "Part 10: Krishna's Departure - The Age of Kali Begins"
        ]
        
        topics = []
        for i in range(min(count, len(mahabharata_episodes))):
            episode_title = mahabharata_episodes[i]
            topic = GeneratedTopic(
                topic=episode_title,
                domain="indian_mythology",
                subtopics=["key events", "major characters", "moral lessons"],
                estimated_interest=0.9,
                keywords=["mahabharata", "epic", "indian", "mythology", f"part{i+1}"],
                generated_at=datetime.now()
            )
            topics.append(topic)
        
        return topics
    
    def _generate_anime_series(self, count: int = 5) -> List[GeneratedTopic]:
        """Generate sequential anime episodes"""
        anime_episodes = [
            "Episode 1: The Hero's Origins - How It All Began",
            "Episode 2: First Powers Awakened - The Training Arc", 
            "Episode 3: The First Great Enemy - Initial Conflict",
            "Episode 4: Bonds of Friendship - Team Formation",
            "Episode 5: The Tournament Arc - Testing New Skills",
            "Episode 6: The Dark Past Revealed - Character Backstory",
            "Episode 7: The Ultimate Transformation - Power Evolution", 
            "Episode 8: The Final Battle Begins - Last Arc Part 1",
            "Episode 9: Victory at Great Cost - The Sacrifice",
            "Episode 10: New Beginnings - Setting Up the Sequel"
        ]
        
        topics = []
        for i in range(min(count, len(anime_episodes))):
            episode_title = anime_episodes[i]
            topic = GeneratedTopic(
                topic=episode_title,
                domain="entertainment", 
                subtopics=["character growth", "plot development", "fan favorites"],
                estimated_interest=0.85,
                keywords=["anime", "episode", "series", "story", f"part{i+1}"],
                generated_at=datetime.now()
            )
            topics.append(topic)
        
        return topics
    
    def generate_daily_topics(self, domains: List[str], topics_per_domain: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Generate daily topics for multiple domains"""
        daily_topics = {}
        
        for domain in domains:
            topics = self.generate_topics_for_domain(domain, topics_per_domain)
            daily_topics[domain] = [
                {
                    "topic": t.topic,
                    "domain": t.domain,
                    "subtopics": t.subtopics,
                    "estimated_interest": t.estimated_interest,
                    "keywords": t.keywords,
                    "generated_at": t.generated_at.isoformat(),
                    "used": t.used
                }
                for t in topics
            ]
        
        return daily_topics
    
    def save_topics_to_queue(self, topics: Dict[str, List[Dict[str, Any]]], queue_file: str = "topic_queue.json"):
        """Save generated topics to JSON queue file"""
        try:
            # Load existing queue if exists
            existing_queue = {}
            if os.path.exists(queue_file):
                with open(queue_file, 'r', encoding='utf-8') as f:
                    existing_queue = json.load(f)
            
            # Add new topics to queue
            timestamp = datetime.now().isoformat()
            for domain, domain_topics in topics.items():
                if domain not in existing_queue:
                    existing_queue[domain] = []
                
                for topic in domain_topics:
                    topic["queue_added_at"] = timestamp
                    existing_queue[domain].append(topic)
            
            # Save updated queue
            with open(queue_file, 'w', encoding='utf-8') as f:
                json.dump(existing_queue, f, indent=2, ensure_ascii=False)
            
            print(f"[TOPIC AGENT] Saved {sum(len(topics) for topics in topics.values())} topics to {queue_file}")
            return True
            
        except Exception as e:
            print(f"[TOPIC AGENT] Error saving topics to queue: {e}")
            return False
    
    def get_next_topic_from_queue(self, domain: str = None, queue_file: str = "topic_queue.json") -> Optional[Dict[str, Any]]:
        """Get next unused topic from queue"""
        try:
            if not os.path.exists(queue_file):
                return None
            
            with open(queue_file, 'r', encoding='utf-8') as f:
                queue = json.load(f)
            
            # Find next unused topic
            if domain and domain in queue:
                domains_to_check = [domain]
            else:
                domains_to_check = list(queue.keys())
            
            for domain_name in domains_to_check:
                for i, topic in enumerate(queue[domain_name]):
                    if not topic.get("used", False):
                        # Mark as used
                        queue[domain_name][i]["used"] = True
                        queue[domain_name][i]["used_at"] = datetime.now().isoformat()
                        
                        # Save updated queue
                        with open(queue_file, 'w', encoding='utf-8') as f:
                            json.dump(queue, f, indent=2, ensure_ascii=False)
                        
                        return topic
            
            return None
            
        except Exception as e:
            print(f"[TOPIC AGENT] Error getting topic from queue: {e}")
            return None
    
    def get_queue_status(self, queue_file: str = "topic_queue.json") -> Dict[str, Any]:
        """Get status of topic queue"""
        try:
            if not os.path.exists(queue_file):
                return {"total_topics": 0, "unused_topics": 0, "domains": {}}
            
            with open(queue_file, 'r', encoding='utf-8') as f:
                queue = json.load(f)
            
            status = {
                "total_topics": 0,
                "unused_topics": 0,
                "domains": {}
            }
            
            for domain, topics in queue.items():
                total = len(topics)
                unused = len([t for t in topics if not t.get("used", False)])
                
                status["domains"][domain] = {
                    "total": total,
                    "unused": unused,
                    "used": total - unused
                }
                
                status["total_topics"] += total
                status["unused_topics"] += unused
            
            return status
            
        except Exception as e:
            print(f"[TOPIC AGENT] Error getting queue status: {e}")
            return {"error": str(e)}

if __name__ == "__main__":
    # Test the topic generation agent
    agent = TopicGenerationAgent()
    
    print("Testing Topic Generation Agent...")
    
    # Generate topics for Indian mythology
    topics = agent.generate_topics_for_domain("indian_mythology", 5)
    
    print(f"\nGenerated {len(topics)} topics for 'indian_mythology':")
    for i, topic in enumerate(topics, 1):
        print(f"{i}. {topic.topic}")
        print(f"   Keywords: {', '.join(topic.keywords)}")
        print(f"   Subtopics: {', '.join(topic.subtopics)}")
        print()
    
    # Generate daily topics for multiple domains
    daily_topics = agent.generate_daily_topics(["indian_mythology", "technology", "science"], 3)
    
    # Save to queue
    agent.save_topics_to_queue(daily_topics)
    
    # Test queue operations
    print("Queue Status:", agent.get_queue_status())
    
    next_topic = agent.get_next_topic_from_queue()
    if next_topic:
        print(f"\nNext topic from queue: {next_topic['topic']}")