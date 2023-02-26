import json

import flask as f

from userProcessing import User

app = f.Flask(__name__)

# let cookies = JSON.parse(atob(document.cookie.split('userData=')[1].replaceAll('"', '').replaceAll('\\', '')))
# document.cookie = `userData=${btoa(JSON.stringify(cookies))}` 

@app.route('/')
def main():

    command = f.request.args.get('c')
    response = f.make_response(f.render_template('index.html'))

    if command == 'new' or f.request.cookies.get('userData') == None:
        # New Player

        response.set_cookie('userData', json.dumps(
            User.getDefaultState()), 60 * 60 * 24 * 360)

        return response

    if command == None and f.request.cookies.get('userData') != None:
        # Continue playing

        return response

    if command == 'update' and f.request.cookies.get('userData') != None:
        # Update user state

        user = User(f.request.cookies.get('userData'))
        user.process()
        updatedUserData = user.getState()
        response.set_cookie('userData', updatedUserData, 60 * 60 * 24 * 360)

        return response

    return 'Sum Ting Uen Wong'


@app.route('/api')
def api():
    
    command = f.request.args.get('c')
    
    if command == 'stocks':
        result = {
            'stocks': []
        }
        
        stocks = User.getDefaultStocks()['stocks']
        for stock in stocks:
            stock_formatted = {
                'id': stock['id'],
                'name': stock['name'],
                'desc': stock['description'],
                'ind': stock['industry']
            }
            
            result['stocks'].append(stock_formatted)
        
        return f.jsonify(result)
    
    if command == 'news':
        result = {
            
        }
        
        data = User.getDefaultStocks()
        stocks = data['stocks']
        
        for stock in stocks:
            result[stock['id']] = {}
            for new in stock['events']:
                result[stock['id']][new['id']] = {
                    'name': new['name'],
                    'desc': new['description']
                }
        
        for ev in data['events']:
            result[str(ev['id'])] = {
                'name': ev['name'],
                'desc': ev['description']
            }
        
        return f.jsonify(result)

if __name__ == '__main__':
    app.run('0.0.0.0', 8080)
