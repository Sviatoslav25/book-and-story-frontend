import axios from 'axios';
import AuthManager from './AuthManager';

const errors = {
  TOKEN_EXPIRED: 'Your session expired. Please login again',
};

class APIService {
  #fetch = async (params) => {
    const { url, data, method, _retry = false } = params;
    if (AuthManager.isAccessTokenExpired()) {
      await this.#tryRefreshingOrLoutAndThrow();
    }
    try {
      const result = await axios(url, {
        headers: {
          Authorization: AuthManager.getAccessToken(),
        },
        method,
        data,
      });
      return result.data;
    } catch (e) {
      if (e?.response?.status === 401) {
        if (_retry) {
          this.logout();
          throw new Error(errors.TOKEN_EXPIRED);
        }

        try {
          await this.#refreshToken();
        } catch {
          throw new Error(errors.TOKEN_EXPIRED);
        }
        const retryData = await this.#fetch({ ...params, _retry: true });
        return retryData;
      }
      throw e;
    }
  };

  #tryRefreshingOrLoutAndThrow = async () => {
    try {
      await this.#refreshToken();
      console.log('Token successfully refreshed');
    } catch (e) {
      console.log('Error refreshing token', e);
      this.logout();
      throw new Error(errors.TOKEN_EXPIRED);
    }
  };

  #refreshToken = async () => {
    const refreshToken = AuthManager.getRefreshToken();
    const {
      data: { accessToken },
    } = await axios.post('/api/auth/token', { token: refreshToken });
    AuthManager.setAccessToken(accessToken);
  };

  async login({ email, password }) {
    const {
      data: { accessToken, refreshToken },
    } = await axios.post('/api/auth/login', { email, password });
    AuthManager.login({ accessToken, refreshToken });
  }

  async logout() {
    const token = AuthManager.getRefreshToken();
    if (token) {
      const result = axios.post('/api/auth/logout', { token });
      AuthManager.logout();
      return result;
    }
    AuthManager.logout();
    return null;
  }

  async registration({ email, password }) {
    const {
      data: { accessToken, refreshToken },
    } = await axios.post('/api/auth/registration', { email, password });
    AuthManager.registration({ accessToken, refreshToken });
  }

  getBookList = async () => {
    return this.#fetch({ url: '/api/books/all', method: 'get' });
  };

  getStoryList = async () => {
    return this.#fetch({ url: '/api/stories/all', method: 'get' });
  };

  addBook = async (data) => {
    return this.#fetch({ url: '/api/books/create', method: 'post', data });
  };

  addStory = async (data) => {
    return this.#fetch({ url: '/api/stories/create', method: 'post', data });
  };

  getBook = (id) => {
    return async () => {
      return this.#fetch({ url: `/api/books/${id}`, method: 'get' });
    };
  };

  getStory = (id) => {
    return async () => {
      return this.#fetch({ url: `/api/stories/${id}`, method: 'get' });
    };
  };

  changeRantingForBook = async ({ bookId, rating }) => {
    return this.#fetch({ url: '/api/books/add_rating', method: 'post', data: { bookId, rating } });
  };

  changeRantingForStories = async ({ storyId, rating }) => {
    return this.#fetch({ url: '/api/stories/add_rating', method: 'post', data: { storyId, rating } });
  };

  searchBooks = (lineForSearch) => {
    return async () => {
      return this.#fetch({ url: `/api/books/search/${lineForSearch}`, method: 'get' });
    };
  };

  searchStories = (lineForSearch) => {
    return async () => {
      return this.#fetch({ url: `/api/stories/search/${lineForSearch}`, method: 'get' });
    };
  };

  getCurrentUserBooks = () => {
    return this.#fetch({ url: '/api/books/my', method: 'get' });
  };
}

export default new APIService();
