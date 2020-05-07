import { Component, OnInit } from '@angular/core';
import { StreamChat, ChannelData, Message, User } from 'stream-chat';
import rug from 'random-username-generator';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Stream Chat Angular';
  channel: ChannelData;
  username = '';
  messages: Message[] = [];
  chatClient: any;
  currentUser: User;

  async joinChat() {
    const username = rug.generate();
    try {
      const response = await axios.post('http://localhost:5500/join', {
        username
      });
      const { token } = response.data;
      const apiKey = response.data.api_key;

      this.chatClient = new StreamChat(apiKey);

      this.currentUser = await this.chatClient.setUser(
        {
          id: username,
          name: username
        },
        token
      );

      const channel = this.chatClient.channel('team', 'general');
      await channel.watch();
      this.channel = channel;
      this.messages = channel.state.messages;
      this.channel.on('message.new', event => {
        this.messages = [...this.messages, event.message];
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }

  async sendMessage(event) {
    const { message } = event;
    if (message.trim() === '') {
      return;
    }

    try {
      await this.channel.sendMessage({
        text: message
      });
    } catch (err) {
      console.log(err);
    }
  }

  public ngOnInit(): void {
    this.joinChat();
  }
}
