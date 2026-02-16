package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

const (
	bufferSize = 4096
)

var bufferPool = sync.Pool{
	New: func() interface{} {
		b := make([]byte, bufferSize)
		return &b
	},
}

type Client struct {
	conn   *websocket.Conn
	UserID string
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  bufferSize,
	WriteBufferSize: bufferSize,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	ticket := r.URL.Query().Get("ticket")
	if ticket == "" {
		http.Error(w, "ticket required", http.StatusUnauthorized)
		return
	}

	key := fmt.Sprintf("ws_ticket:%s", ticket)
	userID, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		http.Error(w, "invalid or expired ticket", http.StatusUnauthorized)
		return
	} else if err != nil {
		log.Printf("redis error: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	if err := rdb.Del(ctx, key).Err(); err != nil {
		log.Printf("failed to delete ticket: %v", err)
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws upgrade failed: %v", err)
		return
	}

	client := &Client{
		conn:   conn,
		UserID: userID,
	}
	log.Printf("client connected: %s (user: %s)", conn.RemoteAddr(), userID)

	go client.readLoop()
}

func (c *Client) readLoop() {
	defer func() {
		c.conn.Close()
		log.Printf("client disconnected: %s", c.conn.RemoteAddr())
	}()

	for {
		messageType, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("read error: %v", err)
			}
			break
		}

		bufPtr := bufferPool.Get().(*[]byte)
		buf := *bufPtr

		n := copy(buf, message)
		log.Printf("received %d bytes from %s", n, c.conn.RemoteAddr())

		if err := c.conn.WriteMessage(messageType, buf[:n]); err != nil {
			log.Printf("write error: %v", err)
			bufferPool.Put(bufPtr)
			break
		}

		bufferPool.Put(bufPtr)
	}
}
