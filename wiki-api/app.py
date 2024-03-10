from typing import Tuple

from flask import Flask, jsonify, request, Response
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# CORS(app, methods=['POST', 'OPTIONS'])

BASE_URL = 'https://en.wikipedia.com'


def filter_link(text_link_tuples: Tuple[str, str]):
    text, link = text_link_tuples
    return (len(text) > 0
            and link is not None
            and link.startswith('/wiki/')
            and ':' not in link)


def get_link_by_name_dict(soup):
    atags = soup.find_all('a')
    links = map(lambda x: [x.getText(), x.attrs.get('href')], atags)
    filtered_links = filter(lambda text_link_tuple: filter_link(text_link_tuple), links)
    return dict(filtered_links)


def get_url(term):
    return f'{BASE_URL}/wiki/{term}'

def fetch_wiki_page(term):
    response = requests.get(get_url(term))
    return 'mw-advancedSearch-searchPreview' not in response.text and \
        'Wikipedia does not have an article with this exact name' not in response.text

@app.route('/verify/', methods=['POST', 'OPTIONS'])
def verify():
    data = request.json
    if data is None:
        return jsonify({'status': 'error', 'message': 'No data provided'})

    if 'terms' not in data or data['terms'] is None or len(data['terms']) != 2:
        return jsonify({'status': 'error', 'message': 'Invalid terms'})

    terms = data['terms']
    correct_terms = {
        term: fetch_wiki_page(term) for term in terms
    }

    return jsonify(correct_terms)

@app.route('/link/<wiki_term>', methods=['GET', 'OPTIONS'])
def get_wiki_terms(wiki_term):
    response = requests.get(get_url(wiki_term))
    soup = BeautifulSoup(response.text)
    response = jsonify(get_link_by_name_dict(soup))
    return response


# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     return response

@app.before_request
def basic_authentication():
    if request.method.lower() == 'options':
        return Response()


if __name__ == '__main__':
    app.run(debug=True, port=8080)
