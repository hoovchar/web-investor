import base64 as b64
import json
import random as r
from decimal import Decimal


class User:

    def __init__(self, userDataB64: str):
        self.userData = json.loads(
            b64.b64decode(userDataB64.encode()).decode())

    def process(self):
        # User actions
        self.updateActions()

        # Stock update
        self.updateStocks()
        self.correctStocks()

        self.userData['stp'] += 1

    def getState(self):
        return b64.b64encode(json.dumps(self.userData).replace(' ', '').encode()).decode()

    def updateStocks(self):
        for stock in self.userData['stocks']:

            minCost = User.getDefaultStockByID(stock['i'])['minCost']

            costDiff = (
                User.getRandomFloat(
                    -(10 + stock['rep']), 10 + stock['rep'])
                ) if stock['i'] != 'GOLD' else (
                    User.getRandomFloat(-0.5, 1)
                )

            cost = stock['cost'][-1] + costDiff
            if cost < minCost:
                cost = (minCost + User.getRandomFloat(1, 10)) if stock['i'] != 'GOLD' else (
                    minCost + User.getRandomFloat(0, 1)
                )

            stock['cost'].append(round(cost, 2))
            
            if stock['i'] == 'GOLD':
                continue

            # Events update: LOCAL
            self.updateLocalEvents()

            # Reputation update
            if stock['rep'] < 0 and r.randint(1, 10) == 1:
                stock['rep'] += 1
            if stock['rep'] > 0 and r.randint(1, 10) == 1:
                stock['rep'] -= 1

        # Events update: GLOBAL
        self.updateGlobalEvents()

    def correctStocks(self):
        for stock in self.userData['stocks']:
            if stock['i'] == 'GOLD':
                while len(stock['cost']) > 5:
                    del stock['cost'][0]
                continue
            
            if stock['rep'] > 8:
                stock['rep'] = 8
            if stock['rep'] < -8:
                stock['rep'] = -8

            while len(stock['evs']) > 5:
                del stock['evs'][0]

            while len(stock['cost']) > 5:
                del stock['cost'][0]

        while len(self.userData['events']) > 5:
            del self.userData['events'][0]

    def updateLocalEvents(self):
        for stock in self.userData['stocks']:
            if stock['i'] == 'GOLD':
                continue
            if r.randint(1, 20) == 1:

                for i in stock['evs']:
                    i[1] = 0

                event = r.choice(
                    User.getDefaultStockByID(stock['i'])['events'])
                
                stock['evs'].append([event['id'], 1])

                stock['rep'] += event['rep']

    def updateGlobalEvents(self):
        if r.randint(1, 33) == 1:
            event = r.choice(User.getDefaultStocks()['events'])

            for i in self.userData['events']:
                i[1] = 0

            self.userData['events'].append([event['id'], 1])

            for stock in self.userData['stocks']:
                if stock['i'] == 'GOLD':
                    continue
                
                if User.getDefaultStockByID(stock['i'])['industry'] == event['influence']:
                    stock['rep'] += event['rep']
                else:
                    stock['rep'] += event['othersRep']

    def updateActions(self):
        for action in self.userData['actions']:

            id = action['k']
            value = action['v']

            if id == 'buy':
                arg = action['a']
                for stock in self.userData['stocks']:
                    if stock['i'] == value:
                        for i in range(arg):
                            if self.userData['mny'] >= stock['cost'][-1]:
                                self.userData['mny'] = float(
                                    Decimal(str(self.userData['mny'])) - Decimal(str(stock['cost'][-1])))

                                if stock['own'] == 0:
                                    stock['p'] = stock['cost'][-1]
                                    stock['own'] += 1
                                    continue
                                stock['own'] += 1

            if id == 'sell':
                arg = action['a']
                for stock in self.userData['stocks']:
                    if stock['i'] == value:
                        for i in range(arg):
                            if stock['own'] > 0:
                                self.userData['mny'] = float((
                                    Decimal(str(self.userData['mny'])) + Decimal(str(stock['cost'][-1]))))
                                stock['own'] -= 1

                            if stock['own'] == 0:
                                try:
                                    del stock['p']
                                except KeyError:
                                    pass

            if id == 'sb':
                industry = User.getDefaultStockByID(value)['industry']
                if self.userData['gold'] >= 150:
                    for stock in self.userData['stocks']:
                        print(f'for {stock["i"]}')

                        if stock['i'] == value:
                            stock['rep'] += -8
                            continue

                        if User.getDefaultStockByID(stock['i'])['industry'] == industry:
                            stock['rep'] += 2

                    self.userData['gold'] += -150

            if id == 'pr':
                industry = User.getDefaultStockByID(value)['industry']
                if self.userData['gold'] >= 150:
                    for stock in self.userData['stocks']:

                        if stock['i'] == value:
                            stock['rep'] += 4
                            continue

                        if User.getDefaultStockByID(stock['i'])['industry'] == industry:
                            stock['rep'] += -2

                    self.userData['gold'] += -150

        while len(self.userData['actions']) > 0:
            del self.userData['actions'][0]

    @staticmethod
    def getDefaultState():
        with open('defaults/stocks.json', 'r') as f:
            dStocks = json.loads(f.read())

        uData = {
            'stp': 1,
            'mny': 100000000000000,
            'gold': 100000000000000,
            'actions': [],
            'events': [],
            'stocks': [],
        }

        for stock in dStocks['stocks']:
            if stock['id'] != 'GOLD': 
                uData['stocks'].append(
                    {
                        'i': stock['id'],
                        "cost": [stock['cost']],
                        "rep": r.randint(-3, 3),
                        "own": 0,
                        "evs": []
                    }
                )
            else:
                uData['stocks'].append(
                    {
                        'i': stock['id'],
                        "cost": [stock['cost']],
                        "own": 0,
                    }
                )

        return b64.b64encode(json.dumps(uData).encode()).decode()

    @staticmethod
    def getRandomFloat(fro, to):
        return round(r.uniform(fro, to), 2)

    @staticmethod
    def getDefaultStockByID(id):
        stocks = User.getDefaultStocks()

        stock = {}
        for i in stocks['stocks']:
            if i['id'] == id:
                stock = i

        if stock == {}:
            return False

        return stock

    @staticmethod
    def getDefaultStocks():
        with open('defaults/stocks.json', 'r') as file:
            stocks = json.loads(file.read())

        return stocks
