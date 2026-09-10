from html import escape

QUESTIONS = [('How satisfied are you with the Canada VRS platform?', 'satisfaction'), ('How often do your calls disconnect unexpectedly?', 'frequency'), ('How often does your call disconnect during an interpreter change?', 'frequency'), ('How clear are your video-mail messages?', 'clarity'), ('How often does the video freeze during a call?', 'frequency'), ('How often is the picture too blurred or pixelated to follow the signing?', 'frequency'), ('How often does the app close unexpectedly?', 'frequency'), ('How easy is it to sign in to the platform?', 'ease'), ('How easy is it to start a call using the platform’s controls?', 'ease'), ('How easy is it to reconnect after a dropped call?', 'ease'), ('How easy is it to report a technical problem?', 'ease'), ('How satisfied are you with the updates you receive after reporting a technical problem?', 'satisfaction')]
SCALES = {'satisfaction': ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'], 'frequency': ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'], 'clarity': ['Very clear', 'Mostly clear', 'Sometimes unclear', 'Often unclear', 'Very unclear'], 'ease': ['Very easy', 'Easy', 'Neither easy nor difficult', 'Difficult', 'Very difficult']}

def questionnaire():
    parts = ['<section id="platform-questions" class="section" aria-labelledby="questions-heading"><div class="section-heading"><p class="eyebrow">Questionnaire preview</p><h2 id="questions-heading">Platform experience questions</h2><p>Think about your experience in the past 30 days. Choose one answer per question, or skip any question. These questions concern the technical platform, not interpreter performance.</p></div><aside class="status" id="questions-status"><p>Preview only: answers are not sent, saved, or counted. They may be cleared when you reload the page or change language. Selecting an answer does not sign the petition.</p></aside><div class="grid two question-grid">']
    for number, (question, scale) in enumerate(QUESTIONS, 1):
        parts.append('<fieldset class="question-card" aria-describedby="questions-status"><legend><span class="question-number" aria-hidden="true">' + str(number).zfill(2) + '</span> ' + escape(question) + '</legend><div class="question-options">')
        for choice, label in enumerate(SCALES[scale] + ['Not applicable / Haven’t used this']):
            parts.append(f'<label><input type="radio" name="platform-question-{number}" value="{choice}" autocomplete="off"><span>' + escape(label) + '</span></label>')
        parts.append('</div></fieldset>')
    parts.append('</div></section>')
    return ''.join(parts)
