import random
import string

def generate_gibberish(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def is_bot(user_agent):
    # Simple bot detection based on user agent strings
    bot_indicators = ['bot', 'crawl', 'spider', 'slurp', 'curl', 'wget', 'python-requests']
    ua = user_agent.lower()
    return any(bot in ua for bot in bot_indicators)
