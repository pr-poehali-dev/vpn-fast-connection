import json
import os
import time
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    '''API для управления VPN подключениями - получение серверов, подключение, отключение'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', 'servers')
    
    if method == 'GET' and path == 'servers':
        servers = [
            {
                'id': '1',
                'name': 'Нидерланды',
                'country': 'Amsterdam',
                'flag': '🇳🇱',
                'ping': 12,
                'load': 45,
                'ip': '185.246.208.82',
                'status': 'online'
            },
            {
                'id': '2',
                'name': 'США',
                'country': 'New York',
                'flag': '🇺🇸',
                'ping': 85,
                'load': 62,
                'ip': '167.172.158.241',
                'status': 'online'
            },
            {
                'id': '3',
                'name': 'Германия',
                'country': 'Frankfurt',
                'flag': '🇩🇪',
                'ping': 18,
                'load': 38,
                'ip': '138.68.73.224',
                'status': 'online'
            },
            {
                'id': '4',
                'name': 'Великобритания',
                'country': 'London',
                'flag': '🇬🇧',
                'ping': 25,
                'load': 51,
                'ip': '146.190.16.200',
                'status': 'online'
            },
            {
                'id': '5',
                'name': 'Япония',
                'country': 'Tokyo',
                'flag': '🇯🇵',
                'ping': 156,
                'load': 29,
                'ip': '54.150.58.117',
                'status': 'online'
            },
            {
                'id': '6',
                'name': 'Сингапур',
                'country': 'Singapore',
                'flag': '🇸🇬',
                'ping': 178,
                'load': 44,
                'ip': '128.199.216.87',
                'status': 'online'
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'servers': servers}),
            'isBase64Encoded': False
        }
    
    if method == 'POST' and path == 'connect':
        body = json.loads(event.get('body', '{}'))
        server_id = body.get('serverId')
        
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vpn_sessions (
                id SERIAL PRIMARY KEY,
                server_id TEXT,
                connected_at TIMESTAMP DEFAULT NOW(),
                status TEXT
            )
        ''')
        
        cursor.execute(
            'INSERT INTO vpn_sessions (server_id, status) VALUES (%s, %s) RETURNING id',
            (server_id, 'connected')
        )
        session_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'sessionId': session_id,
                'message': 'VPN подключен успешно'
            }),
            'isBase64Encoded': False
        }
    
    if method == 'POST' and path == 'disconnect':
        body = json.loads(event.get('body', '{}'))
        session_id = body.get('sessionId')
        
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE vpn_sessions SET status = %s WHERE id = %s',
            ('disconnected', session_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'VPN отключен'
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Not found'}),
        'isBase64Encoded': False
    }
